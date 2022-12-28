/************************
 * Made by [MR Ferry™]  *
 * on December 2022     *
 ************************/

package com.example.uplord.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UplordController{

	@GetMapping("/")
	public String aplod(){
		return "aplod";
	}

}
