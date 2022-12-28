/************************
 * Made by [MR Ferry™]  *
 * on December 2022     *
 ************************/

package com.example.uplord.service;

import com.example.uplord.config.UplordConfig;
import com.example.uplord.utils.UplordUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class UplordChecker{

	private final UplordConfig uplordConfig;

	public boolean checkFile(String name){
		String ext = UplordUtils.getExtension(name);
		String uploadPath = uplordConfig.getUploadPathByExtension(ext);
		File uploadDir = new File(uploadPath);
		if(!uploadDir.exists() || !uploadDir.canRead() || !uploadDir.canWrite()){
			throw new IllegalArgumentException("directory has been deleted, restart application");
		}
		return uploadPath.equals(uplordConfig.getUploadPath()) ?
				Files.exists(Paths.get(uploadPath + name)) : contains(uploadDir, name);
	}

	private boolean contains(File uploadPath, String name){
		File file = new File(uploadPath, name);
		if(file.exists()){
			return true;
		}
		File[] directories = uploadPath.listFiles(File::isDirectory);
		if(directories != null){
			for(File directory : directories){
				uploadPath = directory;
				if(contains(uploadPath, name)){
					return true;
				}
			}
		}
		return false;
	}

}
