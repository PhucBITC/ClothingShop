package com.ecommerShop.clothingsystem.service;

import com.ecommerShop.clothingsystem.dto.TryOnRequest;
import com.ecommerShop.clothingsystem.dto.TryOnResponse;

public interface TryOnService {
    TryOnResponse processTryOn(TryOnRequest request);
}
