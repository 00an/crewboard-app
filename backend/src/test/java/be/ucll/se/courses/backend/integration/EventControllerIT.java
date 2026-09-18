package be.ucll.se.courses.backend.integration;

import be.ucll.se.courses.backend.controller.dto.CreateEventRequest;
import be.ucll.se.courses.backend.controller.dto.LoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockCookie;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import be.ucll.se.courses.backend.controller.dto.CreateShiftRequest;
import com.fasterxml.jackson.databind.JsonNode;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev") // seeds fixture accounts via DbInitializer, which only runs under this profile
@Transactional
class EventControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createEvent_withJwtToken_integrationTest() throws Exception {

        LoginRequest loginRequest = new LoginRequest(
                "organizer@email.com",
                "Organizer@12345!"
        );

        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie jwtCookie = loginResult.getResponse().getCookie("JWT");
        assert jwtCookie != null;

        CreateEventRequest eventRequest = new CreateEventRequest(
                "Integration Test Event",
                "Created with JWT",
                "Test Location",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(2)
        );

        mockMvc.perform(post("/api/events")
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(eventRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Integration Test Event"));
    }

    /**
     * Regression test for a real bug found during manual testing: GET
     * /api/events/{id} used to return the raw JPA {@code Event} entity, whose
     * bidirectional relationship to {@code Shift} (event -> shifts -> each
     * shift's event -> ...) is unguarded and recurses forever the moment an
     * event actually has a shift attached, producing truncated, invalid JSON
     * on the wire. create() never surfaced this (a brand-new event has zero
     * shifts), which is exactly why the bug shipped unnoticed. This test
     * creates an event WITH a shift attached and asserts the response is
     * flat, valid JSON containing no nested "shifts"/"event" cycle.
     */
    @Test
    void getEventById_withShiftAttached_returnsFlatDtoNotRecursiveEntity() throws Exception {
        LoginRequest loginRequest = new LoginRequest(
                "organizer@email.com",
                "Organizer@12345!"
        );

        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie jwtCookie = loginResult.getResponse().getCookie("JWT");
        assert jwtCookie != null;

        CreateEventRequest eventRequest = new CreateEventRequest(
                "Event With Shift",
                "Has a shift attached",
                "Test Location",
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(2)
        );

        var createEventResult = mockMvc.perform(post("/api/events")
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(eventRequest)))
                .andExpect(status().isOk())
                .andReturn();

        long eventId = objectMapper.readTree(createEventResult.getResponse().getContentAsString())
                .get("id").asLong();

        CreateShiftRequest shiftRequest = new CreateShiftRequest(
                "Setup Crew",
                "Main Hall",
                LocalDateTime.now().plusDays(1).withHour(9),
                LocalDateTime.now().plusDays(1).withHour(17),
                3
        );

        mockMvc.perform(post("/api/events/{eventId}/shifts", eventId)
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shiftRequest)))
                .andExpect(status().isOk());

        var getResult = mockMvc.perform(get("/api/events/{eventId}", eventId)
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Event With Shift"))
                .andReturn();

        // The bug produced truncated/invalid JSON, so the strongest assertion
        // is simply that the body parses cleanly and is the flat DTO shape —
        // no "shifts" field at all, since EventResponse never carries one.
        JsonNode body = objectMapper.readTree(getResult.getResponse().getContentAsString());
        org.junit.jupiter.api.Assertions.assertFalse(body.has("shifts"),
                "GET /api/events/{id} must return the flat EventResponse DTO, not the raw entity");
    }

}
