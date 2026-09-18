package be.ucll.se.courses.backend.controller.dto;

public class MeDto {
    private String email;
    public MeDto() { }
    public MeDto(String email) { this.email = email; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
