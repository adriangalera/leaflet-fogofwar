const mockEasyButton = () => {
    global.L = {
        easyButton: jest.fn().mockImplementation((name, fn) => {
            return {
                name: name,
                click: jest.fn().mockResolvedValue(fn())
            }
        })
    }
}

const mockOpenFilePicker = (files) => {
    let fileHandles = []
    for (let [fileName, fileContent] of Object.entries(files)) {
        fileHandles.push(mockFileHandle(fileName, fileContent))
    }

    global.window = {
        showOpenFilePicker: jest.fn().mockImplementation(() => {
            return fileHandles
        })
    }
}

const mockSaveFilePicker = () => {
    const writableMock = {
        write: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined)
    }
    global.window = {
        showSaveFilePicker: jest.fn().mockImplementation(() => {
            return mockFileHandle(undefined, undefined, writableMock)
        })
    }
    return writableMock
}

const mockFile = (fileContents) => {
    return { text: () => fileContents }
}

const mockFileHandle = (fileName, fileContents, writable) => {
    return {
        name: fileName,
        getFile: () => mockFile(fileContents),
        createWritable: () => writable
    }
}

export { mockEasyButton, mockOpenFilePicker, mockSaveFilePicker, mockFileHandle }