package com.example.uplord.service;

import com.example.uplord.config.UplordConfig;
import com.example.uplord.utils.UplordUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/************************
 * Made by [MR Ferry™]  *
 * on April 2019        *
 ************************/

@Log4j2
@Service
@RequiredArgsConstructor
public class UplordExecutor{

	private final UplordConfig uplordConfig;

	public String upload(MultipartFile file, boolean overwritten) throws IOException{
		String fileName = file.getOriginalFilename();
		String ext = UplordUtils.getExtension(fileName);
		int filecount = 2;

		String uploadPath = uplordConfig.getUploadPathByExtension(ext);
		Path path = Paths.get(uploadPath + fileName);
		if(!overwritten){
			while(Files.exists(path)){
				path = Paths.get(uploadPath + FilenameUtils.removeExtension(fileName) + '_' + filecount++ +
						'.' + ext);
			}
		}
		file.transferTo(path);
		return path.getFileName().toString();
	}

}
