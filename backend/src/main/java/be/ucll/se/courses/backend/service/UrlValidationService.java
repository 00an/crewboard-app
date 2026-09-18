package be.ucll.se.courses.backend.service;

import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;

/**
 * Validates whether a user-supplied URL would be safe to fetch, without ever
 * actually fetching it. Used to demonstrate SSRF-prevention controls: scheme
 * allow-listing, port restriction, internal-hostname blocking, and — most
 * importantly — checking the *resolved* IP address rather than trusting the
 * hostname string, which is what defeats DNS-rebinding bypass attempts.
 */
@Service
public class UrlValidationService {

    public UrlValidationResult validate(String urlString) {
        URL url;
        try {
            url = new URL(urlString);
        } catch (MalformedURLException e) {
            return UrlValidationResult.reject("Malformed URL");
        }

        String protocol = url.getProtocol();
        if (!"http".equals(protocol) && !"https".equals(protocol)) {
            return UrlValidationResult.reject("Only http/https URLs are allowed");
        }

        int port = url.getPort();
        if (port != -1 && port != 80 && port != 443) {
            return UrlValidationResult.reject("Only ports 80 and 443 are allowed");
        }

        String host = url.getHost();
        if (host == null || host.isBlank()) {
            return UrlValidationResult.reject("Missing host");
        }

        String lowerHost = host.toLowerCase();
        if (lowerHost.equals("localhost")
                || lowerHost.endsWith(".internal")
                || lowerHost.endsWith(".local")) {
            return UrlValidationResult.reject("Internal hostname is not allowed");
        }

        InetAddress[] addresses;
        try {
            addresses = InetAddress.getAllByName(host);
        } catch (UnknownHostException e) {
            return UrlValidationResult.reject("Host could not be resolved");
        }

        // Check the RESOLVED IP, not just the hostname string — this is what
        // defeats DNS-rebinding bypasses (a public-looking hostname that
        // resolves to a private/internal IP).
        for (InetAddress address : addresses) {
            if (address.isLoopbackAddress()
                    || address.isLinkLocalAddress()
                    || address.isSiteLocalAddress()
                    || address.isAnyLocalAddress()
                    || address.isMulticastAddress()) {
                return UrlValidationResult.reject(
                        "URL resolves to a private, loopback, or link-local address");
            }
        }

        return UrlValidationResult.allow();
    }

    public record UrlValidationResult(String status, String reason) {
        static UrlValidationResult allow() {
            return new UrlValidationResult("allow", null);
        }

        static UrlValidationResult reject(String reason) {
            return new UrlValidationResult("reject", reason);
        }
    }
}