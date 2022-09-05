var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Directory, Filesystem, Encoding } from "@capacitor/filesystem";
/**
 * File utilities for CodePush.
 */
export class FileUtil {
    static directoryExists(directory, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statResult = yield Filesystem.stat({ directory, path });
                // directory for Android, NSFileTypeDirectory for iOS
                return statResult.type === "directory" || statResult.type === "NSFileTypeDirectory";
            }
            catch (error) {
                return false;
            }
        });
    }
    static writeStringToDataFile(content, path, createIfNotExists, callback) {
        FileUtil.writeStringToFile(content, Directory.Data, path, createIfNotExists, callback);
    }
    static fileExists(directory, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statResult = yield Filesystem.stat({ directory, path });
                // file for Android, NSFileTypeRegular for iOS
                return statResult.type === "file" || statResult.type === "NSFileTypeRegular";
            }
            catch (error) {
                return false;
            }
        });
    }
    /**
     * Makes sure the given directory exists and is empty.
     */
    static cleanDataDirectory(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield FileUtil.dataDirectoryExists(path)) {
                yield FileUtil.deleteDataDirectory(path);
            }
            yield Filesystem.mkdir({ directory: Directory.Data, path, recursive: true });
            const appDir = yield Filesystem.getUri({ directory: Directory.Data, path });
            return appDir.uri;
        });
    }
    static getUri(fsDir, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Filesystem.getUri({ directory: fsDir, path });
            return result.uri;
        });
    }
    static getDataUri(path) {
        return FileUtil.getUri(Directory.Data, path);
    }
    static dataDirectoryExists(path) {
        return FileUtil.directoryExists(Directory.Data, path);
    }
    static copyDirectoryEntriesTo(sourceDir, destinationDir, ignoreList = []) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
                Native-side exception occurs while trying to copy “.DS_Store” and “__MACOSX” entries generated by macOS, so just skip them
            */
            if (ignoreList.indexOf(".DS_Store") === -1) {
                ignoreList.push(".DS_Store");
            }
            if (ignoreList.indexOf("__MACOSX") === -1) {
                ignoreList.push("__MACOSX");
            }
            // @capacitor/filesystem plugin throw error when destination directory already exists.
            if (yield FileUtil.directoryExists(destinationDir.directory, destinationDir.path)) {
                const { files } = yield Filesystem.readdir(sourceDir);
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (ignoreList.includes(file))
                        continue;
                    const sourcePath = sourceDir.path + "/" + file;
                    const destPath = destinationDir.path + "/" + file;
                    const source = Object.assign(Object.assign({}, sourceDir), { path: sourcePath });
                    const destination = Object.assign(Object.assign({}, destinationDir), { path: destPath });
                    if (yield FileUtil.directoryExists(source.directory, source.path)) { // is directory
                        yield FileUtil.copyDirectoryEntriesTo(source, destination);
                    }
                    else { // is file
                        yield FileUtil.copy(source, destination);
                    }
                }
            }
            else {
                yield FileUtil.copy(sourceDir, destinationDir);
            }
        });
    }
    static copy(source, destination) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Filesystem.copy({ directory: source.directory, from: source.path, to: destination.path, toDirectory: destination.directory });
        });
    }
    /**
     * Recursively deletes the contents of a directory.
     */
    static deleteDataDirectory(path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Filesystem.rmdir({ directory: Directory.Data, path, recursive: true }).then(() => null);
        });
    }
    /**
     * Deletes a given set of files from a directory.
     */
    static deleteEntriesFromDataDirectory(dirPath, filesToDelete) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const file of filesToDelete) {
                const path = dirPath + "/" + file;
                const fileExists = yield FileUtil.fileExists(Directory.Data, path);
                if (!fileExists)
                    continue;
                try {
                    yield Filesystem.deleteFile({ directory: Directory.Data, path });
                }
                catch (error) {
                    /* If delete fails, silently continue */
                    console.log("Could not delete file: " + path);
                }
            }
        });
    }
    /**
     * Writes a string to a file.
     */
    static writeStringToFile(data, directory, path, createIfNotExists, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Filesystem.writeFile({ directory, path, data, encoding: Encoding.UTF8 });
                callback(null, null);
            }
            catch (error) {
                callback(new Error("Could write the current package information file. Error code: " + error.code), null);
            }
        });
    }
    static readFile(directory, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield Filesystem.readFile({ directory, path, encoding: Encoding.UTF8 });
            return result.data;
        });
    }
    static readDataFile(path) {
        return FileUtil.readFile(Directory.Data, path);
    }
}
//# sourceMappingURL=fileUtil.js.map