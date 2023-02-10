/************************
 * Made by [MR Ferry™]  *
 * on December 2022     *
 ************************/

package com.example.uplord.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class PathCheckerConfig{
	private final UplordConfig uplordConfig;

	@PostConstruct
	public void construct() throws IOException{
		String uploadPath = uplordConfig.getUploadPath();
		File file = new File(uploadPath);
		if(!file.exists()){
			Path path = Files.createDirectory(file.toPath());
			System.out.println("created " + path.toAbsolutePath());
		} else if(file.isFile() || !file.canRead() || !file.canWrite()){
			throw new IOException("invalid directory");
		}
		Map<String, Set<String>> category = uplordConfig.getCategory();
		category.forEach((k, v) -> {
			File dir = new File(uploadPath + k);
			if(!dir.exists()){
				try{
					Path path = Files.createDirectory(dir.toPath());
					System.out.println("created: " + path.toAbsolutePath());
				} catch(IOException e){
					throw new IllegalArgumentException(e);
				}
			}
		});
	}

}
