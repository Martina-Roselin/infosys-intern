package com.app.servicefinder.controller;

import com.app.servicefinder.model.ServiceProvider; // Import your new model
import com.app.servicefinder.service.UserService;   // Import your new service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatbotController {

    @Autowired
    private UserService userService; // Autowire your new UserService

    @PostMapping("/chatbot-hook")
    public ResponseEntity<?> handleDialogflowWebhook(@RequestBody Map<String, Object> dialogflowRequest) {
        
        System.out.println("Dialogflow Request: " + dialogflowRequest);

        // --- 1. Parse the Dialogflow Request ---
        Map<String, Object> queryResult = (Map<String, Object>) dialogflowRequest.get("queryResult");
        Map<String, Object> parameters = (Map<String, Object>) queryResult.get("parameters");
        
        String intentName = ((Map<String, String>) queryResult.get("intent")).get("displayName");
        String category = (String) parameters.get("service_category");
        String location = (String) parameters.get("location");

        String fulfillmentText = "Sorry, I couldn't find any results for that.";

        // --- 2. Call Your Service Based on Intent ---
        if ("FindProvider".equals(intentName)) {
            
            // --- THIS IS THE FIX ---
            // We call your new service which returns List<ServiceProvider>
            // We pass 'category' to the 'serviceType' parameter
            List<ServiceProvider> providers = userService.searchProviders(category, location);
            // -----------------------
            
            if (providers.isEmpty()) {
                fulfillmentText = String.format("Sorry, I couldn't find any %s services in %s.", category, location);
            } else if (providers.size() == 1) {
                // And we get the name from the ServiceProvider object
                fulfillmentText = String.format("I found 1 %s in %s: %s", category, location, providers.get(0).getName());
            } else {
                fulfillmentText = String.format("I found %d %s services in %s.", providers.size(), category, location);
            }
        }

        // --- 3. Format the Response for Dialogflow ---
        Map<String, Object> response = new HashMap<>();
        response.put("fulfillmentText", fulfillmentText);

        return ResponseEntity.ok(response);
    }
}