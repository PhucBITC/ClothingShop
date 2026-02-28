package com.ecommerShop.clothingsystem.service.impl;

import com.ecommerShop.clothingsystem.model.ShippingAddress;
import com.ecommerShop.clothingsystem.model.User;
import com.ecommerShop.clothingsystem.repository.ShippingAddressRepository;
import com.ecommerShop.clothingsystem.repository.UserRepository;
import com.ecommerShop.clothingsystem.service.ShippingAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShippingAddressServiceImpl implements ShippingAddressService {

    @Autowired
    private ShippingAddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<ShippingAddress> getAddressesByUserId(User user) {
        return addressRepository.findByUser(user);
    }

    @Override
    public List<ShippingAddress> getAddressesByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return addressRepository.findByUser(user);
    }

    @Override
    @Transactional
    public ShippingAddress addAddress(User user, ShippingAddress address) {
        if (address.isDefault()) {
            addressRepository.resetDefaultAddress(user);
        }

        // If it's the first address, make it default
        List<ShippingAddress> existing = addressRepository.findByUser(user);
        if (existing.isEmpty()) {
            address.setDefault(true);
        }

        address.setUser(user);
        return addressRepository.save(address);
    }

    @Override
    @Transactional
    public ShippingAddress updateAddress(User user, Long id, ShippingAddress addressDetails) {
        ShippingAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (addressDetails.isDefault() && !address.isDefault()) {
            addressRepository.resetDefaultAddress(user);
        }

        address.setFullName(addressDetails.getFullName());
        address.setPhone(addressDetails.getPhone());
        address.setProvince(addressDetails.getProvince());
        address.setDistrict(addressDetails.getDistrict());
        address.setWard(addressDetails.getWard());
        address.setStreetAddress(addressDetails.getStreetAddress());
        address.setNote(addressDetails.getNote());
        address.setDefault(addressDetails.isDefault());
        address.setLatitude(addressDetails.getLatitude());
        address.setLongitude(addressDetails.getLongitude());

        return addressRepository.save(address);
    }

    @Override
    @Transactional
    public void deleteAddress(User user, Long id) {
        ShippingAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        addressRepository.delete(address);

        // If deleted was default, make another one default
        if (address.isDefault()) {
            List<ShippingAddress> remaining = addressRepository.findByUser(user);
            if (!remaining.isEmpty()) {
                ShippingAddress newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Override
    @Transactional
    public ShippingAddress setDefaultAddress(User user, Long id) {
        addressRepository.resetDefaultAddress(user);
        ShippingAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        address.setDefault(true);
        return addressRepository.save(address);
    }

    @Override
    public ShippingAddress getAddressById(Long id) {
        return addressRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public ShippingAddress adminAddAddress(Long userId, ShippingAddress address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return addAddress(user, address);
    }

    @Override
    @Transactional
    public ShippingAddress adminUpdateAddress(Long userId, Long id, ShippingAddress addressDetails) {
        ShippingAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (addressDetails.isDefault() && !address.isDefault()) {
            addressRepository.resetDefaultAddress(address.getUser());
        }

        address.setFullName(addressDetails.getFullName());
        address.setPhone(addressDetails.getPhone());
        address.setProvince(addressDetails.getProvince());
        address.setDistrict(addressDetails.getDistrict());
        address.setWard(addressDetails.getWard());
        address.setStreetAddress(addressDetails.getStreetAddress());
        address.setNote(addressDetails.getNote());
        address.setDefault(addressDetails.isDefault());
        address.setLatitude(addressDetails.getLatitude());
        address.setLongitude(addressDetails.getLongitude());

        return addressRepository.save(address);
    }

    @Override
    @Transactional
    public void adminDeleteAddress(Long id) {
        ShippingAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        User user = address.getUser();
        addressRepository.delete(address);

        if (address.isDefault()) {
            List<ShippingAddress> remaining = addressRepository.findByUser(user);
            if (!remaining.isEmpty()) {
                ShippingAddress newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }
}
