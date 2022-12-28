package com.example.uplord;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class UplordApplication{

	public static void main(String[] args){
		SpringApplication.run(UplordApplication.class, args);
	}

}
