import Foundation
import WebKit
import Cocoa

let svgPath = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("assets/favicon.svg")
guard let svgData = try? Data(contentsOf: svgPath), let svgString = String(data: svgData, encoding: .utf8) else {
    print("Failed to read assets/favicon.svg")
    exit(1)
}

let htmlContent = """
<!DOCTYPE html>
<html>
<head>
<style>
  html, body { margin: 0; padding: 0; background: transparent; width: 100%; height: 100%; overflow: hidden; }
  svg { width: 100%; height: 100%; display: block; }
</style>
</head>
<body>
\(svgString)
</body>
</html>
"""

let sizes: [(Int, String)] = [
    (16, "assets/favicon-16x16.png"),
    (32, "assets/favicon-32x32.png"),
    (180, "assets/apple-touch-icon.png"),
    (32, "favicon.ico")
]

class Snapshotter: NSObject, WKNavigationDelegate {
    let size: Int
    let outputPath: String
    let html: String
    var webView: WKWebView!
    var isDone = false
    
    init(size: Int, outputPath: String, html: String) {
        self.size = size
        self.outputPath = outputPath
        self.html = html
        super.init()
        
        let config = WKWebViewConfiguration()
        self.webView = WKWebView(frame: NSRect(x: 0, y: 0, width: size, height: size), configuration: config)
        self.webView.setValue(false, forKey: "drawsBackground")
        self.webView.navigationDelegate = self
        self.webView.loadHTMLString(html, baseURL: nil)
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            let snapConfig = WKSnapshotConfiguration()
            snapConfig.rect = NSRect(x: 0, y: 0, width: self.size, height: self.size)
            webView.takeSnapshot(with: snapConfig) { image, error in
                if let image = image,
                   let tiffData = image.tiffRepresentation,
                   let bitmap = NSBitmapImageRep(data: tiffData),
                   let pngData = bitmap.representation(using: .png, properties: [:]) {
                    let outURL = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent(self.outputPath)
                    try? pngData.write(to: outURL)
                    print("Generated transparent PNG: \(self.outputPath) (\(self.size)x\(self.size))")
                } else if let error = error {
                    print("Error taking snapshot: \(error)")
                }
                self.isDone = true
            }
        }
    }
}

for (size, path) in sizes {
    let snapshotter = Snapshotter(size: size, outputPath: path, html: htmlContent)
    let timeout = Date(timeIntervalSinceNow: 3.0)
    while !snapshotter.isDone && Date() < timeout {
        RunLoop.main.run(mode: .default, before: Date(timeIntervalSinceNow: 0.1))
    }
}
print("All renders completed.")
