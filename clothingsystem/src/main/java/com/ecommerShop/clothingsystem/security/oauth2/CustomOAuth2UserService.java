package com.ecommerShop.clothingsystem.security.oauth2;

import com.ecommerShop.clothingsystem.model.AuthProvider;
import com.ecommerShop.clothingsystem.model.Role;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (Exception ex) {
            // Throwing an instance of AuthenticationException will trigger the
            // OAuth2AuthenticationFailureHandler
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        if (email == null || email.isEmpty()) {
            // Facebook might not return email if not granted permissions or phone number
            // used
            // For simplicity, we require email. In production, handle this gracefully.
            throw new RuntimeException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Updat user details if needed
            user.setFullName(oauth2User.getAttribute("name"));
            user.setAuthProvider(
                    AuthProvider.valueOf(oAuth2UserRequest.getClientRegistration().getRegistrationId().toUpperCase()));
            userRepository.save(user);
        } else {
            user = new User();
            user.setEmail(email);
            user.setFullName(oauth2User.getAttribute("name"));
            user.setRole(Role.CUSTOMER);
            user.setAuthProvider(
                    AuthProvider.valueOf(oAuth2UserRequest.getClientRegistration().getRegistrationId().toUpperCase()));
            // Password is not needed for OAuth2 users, but entity might require it.
            // Set a dummy encrypted password or change schema to allow null.
            // Using a random string here as we won't allow password login for this user
            // initially
            // unless they set one via "Forgot Password".
            user.setPassword("");
            userRepository.save(user);
        }

        return oauth2User;
    }
}
