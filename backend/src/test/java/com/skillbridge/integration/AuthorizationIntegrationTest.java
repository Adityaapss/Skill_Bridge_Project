package com.skillbridge.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** End-to-end checks of object-level authorization against the seeded demo data (H2). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthorizationIntegrationTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    private JsonNode login(String email, String password) throws Exception {
        MvcResult r = mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk()).andReturn();
        return mapper.readTree(r.getResponse().getContentAsString());
    }

    private String bearer(JsonNode login) {
        return "Bearer " + login.get("token").asText();
    }

    @Test
    void unauthenticatedRequestsGet401() throws Exception {
        mvc.perform(get("/employees/1/skills")).andExpect(status().isUnauthorized());
        mvc.perform(get("/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void employeeCannotReadOrWriteAnotherEmployeesSkills() throws Exception {
        JsonNode jane = login("jane@skillbridge.com", "employee123");
        long otherId = login("employee@skillbridge.com", "employee123").get("id").asLong();

        mvc.perform(get("/employees/" + otherId + "/skills").header("Authorization", bearer(jane)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/employees/" + jane.get("id").asLong() + "/skills").header("Authorization", bearer(jane)))
                .andExpect(status().isOk());
        mvc.perform(post("/employees/" + otherId + "/skills").header("Authorization", bearer(jane))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"skillId\":1,\"proficiencyLevel\":3,\"interestLevel\":3,\"source\":\"SELF_REPORTED\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void employeeCannotApproveTheirOwnSkill() throws Exception {
        JsonNode emp = login("employee@skillbridge.com", "employee123");
        mvc.perform(post("/employees/0/skills/1/approve").header("Authorization", bearer(emp))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"managerId\":" + emp.get("id").asLong() + "}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void employeeCannotSeeOtherProfilesOrOrgAnalytics() throws Exception {
        JsonNode emp = login("employee@skillbridge.com", "employee123");
        long adminId = login("admin@skillbridge.com", "admin123").get("id").asLong();
        mvc.perform(get("/employees/" + adminId).header("Authorization", bearer(emp)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/analytics/organization/summary").header("Authorization", bearer(emp)))
                .andExpect(status().isForbidden());
    }

    @Test
    void passwordNeverAppearsInResponses() throws Exception {
        JsonNode admin = login("admin@skillbridge.com", "admin123");
        MvcResult r = mvc.perform(get("/employees").header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andReturn();
        assertEquals(false, r.getResponse().getContentAsString().contains("password"));
    }

    @Test
    void hrSeesOrganisationAnalytics() throws Exception {
        JsonNode admin = login("admin@skillbridge.com", "admin123");
        mvc.perform(get("/analytics/organization/summary").header("Authorization", bearer(admin)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.employees").value(4));
        mvc.perform(get("/analytics/organization/bus-factor").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
        mvc.perform(get("/analytics/organization/supply-demand").header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void notificationsAreScopedToTheCaller() throws Exception {
        JsonNode emp = login("employee@skillbridge.com", "employee123");
        mvc.perform(get("/notifications/unread-count").header("Authorization", bearer(emp)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.count").isNumber());
    }

    @Test
    void unknownPathsAre404NotServerErrors() throws Exception {
        JsonNode admin = login("admin@skillbridge.com", "admin123");
        mvc.perform(get("/does-not-exist").header("Authorization", bearer(admin)))
                .andExpect(status().isNotFound());
    }

    @Test
    void editingAnApprovedSkillLevelRequiresReapproval() throws Exception {
        JsonNode emp = login("employee@skillbridge.com", "employee123");
        long id = emp.get("id").asLong();
        MvcResult list = mvc.perform(get("/employees/" + id + "/skills").header("Authorization", bearer(emp)))
                .andExpect(status().isOk()).andReturn();
        JsonNode first = mapper.readTree(list.getResponse().getContentAsString()).get(0);
        long skillId = first.get("skillId").asLong();
        int newLevel = first.get("proficiencyLevel").asInt() == 3 ? 2 : 3;
        mvc.perform(put("/employees/" + id + "/skills/" + skillId).header("Authorization", bearer(emp))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"skillId\":" + skillId + ",\"proficiencyLevel\":" + newLevel
                        + ",\"interestLevel\":2,\"source\":\"SELF_REPORTED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approvalStatus").value("PENDING"));
    }
}
