/************************
 * Made by [MR Ferry™]  *
 * on December 2022     *
 ************************/

package com.example.uplord.config;

import lombok.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import java.io.File;
import java.util.Map;
import java.util.Set;

@Value
@ConstructorBinding
@ConfigurationProperties("app")
public class UplordConfig{
	Map<String, Set<String>> category;
	String uploadPath;

	public String getUploadPathByExtension(String extension){
		return category
				.entrySet().stream()
				.filter(entry -> entry.getValue().contains(extension))
				.findAny()
				.map(Map.Entry::getKey)
				.map(str -> uploadPath + str + File.separatorChar)
				.orElseGet(this::getUploadPath);
	}

}
