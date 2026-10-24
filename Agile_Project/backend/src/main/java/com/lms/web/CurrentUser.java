package com.lms.web;

import com.lms.entity.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;

public final class CurrentUser {

    private CurrentUser() {}

    public static Long getUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        Object id = session.getAttribute(SessionKeys.USER_ID);
        return (id instanceof Long) ? (Long) id : null;
    }

    public static Long requireUserId(HttpServletRequest request) {
        Long id = getUserId(request);
        if (id == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required. Please login.");
        }
        return id;
    }

    public static Role getRole(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        Object role = session.getAttribute(SessionKeys.USER_ROLE);
        if (role instanceof Role) {
            return (Role) role;
        }
        if (role instanceof String) {
            try {
                return Role.valueOf((String) role);
            } catch (Exception ignored) {}
        }
        return null;
    }

    public static void requireRole(HttpServletRequest request, Role... allowedRoles) {
        Role role = getRole(request);
        if (role == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required. Please login.");
        }
        for (Role allowed : allowedRoles) {
            if (role == allowed) {
                return;
            }
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. Insufficient permissions.");
    }

    public static void requireAdmin(HttpServletRequest request) {
        requireRole(request, Role.ADMIN, Role.LIBRARIAN);
    }
}
