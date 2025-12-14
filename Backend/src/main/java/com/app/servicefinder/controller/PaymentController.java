package com.app.servicefinder.controller;

import com.app.servicefinder.dto.BookingDTO;
import com.app.servicefinder.service.UserService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.app.servicefinder.model.User;
import java.time.LocalDate;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;
    
    @Autowired
    private UserService userService;

    // 1. Create Order (Called when user clicks "Pay")
    @PostMapping("/create-order")
    public ResponseEntity<String> createOrder(@RequestBody Map<String, Object> data) throws RazorpayException {
        
        // Razorpay handles amounts in "paise" (100 paise = 1 Rupee)
        int amount = Integer.parseInt(data.get("amount").toString());

        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount * 100); // Convert to paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "order_rcptid_" + System.currentTimeMillis());

        Order order = razorpayClient.orders.create(orderRequest);

        // Return the order ID (e.g. "order_EKwxwAgItmmXdp")
        return ResponseEntity.ok(order.get("id").toString());
    }

    // 2. Verify Payment (Called after user pays successfully)
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal User userPrincipal, 
            @RequestBody Map<String, Object> data
    ) {
        try {
            String orderId = (String) data.get("razorpay_order_id");
            String paymentId = (String) data.get("razorpay_payment_id");
            String signature = (String) data.get("razorpay_signature");
            
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            // Verify the signature
            boolean isSignatureValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isSignatureValid) {
                // --- Payment Successful ---
                // Now we create the booking
                
                @SuppressWarnings("unchecked")
                Map<String, Object> bookingData = (Map<String, Object>) data.get("bookingDTO");
                
                BookingDTO bookingDTO = new BookingDTO();
                bookingDTO.setServiceProviderId(Long.valueOf(bookingData.get("serviceProviderId").toString()));
                bookingDTO.setDateOfService(LocalDate.parse((String) bookingData.get("dateOfService")));
                bookingDTO.setTimeSlot((String) bookingData.get("timeSlot"));
                bookingDTO.setPaymentMethod("ONLINE");
                
                BookingDTO savedBooking = userService.bookSerrvice(userPrincipal.getId(), bookingDTO);
                
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Payment verified and booking confirmed!",
                    "booking", savedBooking
                ));
            } else {
                return ResponseEntity.status(400).body("Payment verification failed");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}