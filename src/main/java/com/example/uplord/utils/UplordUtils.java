/************************
 * Made by [MR Ferry™]  *
 * on December 2022     *
 ************************/

package com.example.uplord.utils;

import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.util.Optional;

public final class UplordUtils{
	private UplordUtils(){
	}

	public static String getExtension(String fileName){
		return Optional.ofNullable(FilenameUtils.getExtension(fileName))
				.map(String::toLowerCase)
				.orElse("");
	}

	public static String decorateSlash(String path){
		return path.endsWith(File.separator) ?
				path :
				path + File.separator;
	}

}
