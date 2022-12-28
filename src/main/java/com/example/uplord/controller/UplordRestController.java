/************************
 * Made by [MR Ferry™]  *
 * on December 2022     *
 ************************/

package com.example.uplord.controller;

import com.example.uplord.dto.FileCheckerDto;
import com.example.uplord.service.UplordChecker;
import com.example.uplord.service.UplordExecutor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
public class UplordRestController{

	private final UplordChecker uplordChecker;
	private final UplordExecutor uplordExecutor;

	@PostMapping("/cek")
	public boolean checkFile(@RequestBody FileCheckerDto fileCheckerDto){
		return uplordChecker.checkFile(fileCheckerDto.getFileName());
	}

	@PostMapping("/aplod")
	public String aplod(@RequestParam("file") MultipartFile file,
						@RequestParam("overwritten") boolean overwritten) throws IOException{
		if(file.isEmpty()){
			return "no file uploaded";
		}
		return uplordExecutor.upload(file, overwritten);
	}

}
