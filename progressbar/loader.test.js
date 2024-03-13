import { loader } from "./loader";

mockDomUtil = () => {
    global.L = {}
    global.L.DomUtil = {
        create: jest.fn().mockReturnValue("progress")
    }
}

mockDocument = (mockDivElement) => {
    global.document = {
        getElementsByClassName: jest.fn().mockReturnValue([mockDivElement])
    }
}

test("should return created div onAdd", () => {
    mockDomUtil()
    const div = loader.onAdd()
    expect(global.L.DomUtil.create).toHaveBeenCalledWith("progress", "loader")
    expect(div).toBe("progress")
})

test("should hide div on stop", () => {
    const mockDivElement = {
        "style": {
            "display": "mockvalue"
        }
    }
    mockDocument(mockDivElement)
    loader.stop()
    expect(global.document.getElementsByClassName).toHaveBeenCalledWith("loader")
    expect(mockDivElement.style.display).toBe("none")
})

test("should display on load", () => {
    const mockProgressBar = {
        "style": {
            "display": "mockvalue"
        }
    }
    mockDocument(mockProgressBar)
    loader.load()
    expect(global.document.getElementsByClassName).toHaveBeenCalledWith("loader")
    expect(mockProgressBar.style.display).toBe("block")
})

test("should display progressbar with current/max on load", () => {
    const mockProgressBar = {
        min: 0,
        max: 0,
        value: 0,
        "style": {
            "display": "mockvalue"
        }
    }
    mockDocument(mockProgressBar)
    loader.loadWithCurrentTotal(1, 100)
    expect(global.document.getElementsByClassName).toHaveBeenCalledWith("loader")
    expect(mockProgressBar.style.display).toBe("block")
    expect(mockProgressBar.min).toBe(0)
    expect(mockProgressBar.max).toBe(100)
    expect(mockProgressBar.value).toBe(1)
})