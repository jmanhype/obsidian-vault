# Mobile MCP - iOS and Android Automation Setup Guide

## 🚀 Executive Summary
Mobile MCP (Model Context Protocol) is a powerful automation tool that enables Claude Code to interact with iOS and Android devices through simulators/emulators. This guide documents the complete setup process, troubleshooting steps, and usage examples.

---

## Overview

### What is Mobile MCP?
Mobile MCP is an MCP server that provides mobile automation capabilities to AI assistants like Claude. It allows:
- Taking screenshots of mobile devices
- Listing UI elements on screen
- Clicking, typing, and swiping
- Launching apps and navigating
- Both iOS and Android support

### Architecture
```yaml
components:
  mobile_mcp_server:
    - Runs as MCP server (stdio/SSE modes)
    - Communicates with device automation frameworks
    - Provides standardized API for mobile control
  
  ios_automation:
    - WebDriverAgent (Facebook's iOS automation)
    - iOS Simulator integration
    - Accessibility tree access
  
  android_automation:
    - Android Debug Bridge (ADB)
    - Android Emulator support
    - UI Automator framework
```

---

## Installation Process

### Step 1: Clone and Install Mobile MCP

```bash
# Clone the repository
git clone https://github.com/mobile-next/mobile-mcp.git
cd mobile-mcp

# Install dependencies
npm install

# Build the TypeScript project
npm run build

# Verify build success
ls -la lib/index.js
```

### Step 2: Add to Claude Code

```bash
# Use Claude's built-in MCP add command
claude mcp add

# When prompted:
# - Name: mobile-mcp
# - Command: node
# - Arguments: /Users/speed/Downloads/multi-agent-system/mobile-mcp/lib/index.js
```

This automatically configures the MCP server in Claude Code's settings.

### Step 3: Configure Claude Desktop (Optional)

If you also want to use it in Claude Desktop, add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mobile-mcp": {
      "command": "node",
      "args": ["/Users/speed/Downloads/multi-agent-system/mobile-mcp/lib/index.js"]
    }
  }
}
```

---

## iOS Setup (WebDriverAgent)

### Prerequisites
- Xcode installed
- iOS Simulator downloaded
- Command Line Tools configured

### Step 1: Install iOS Runtime

1. Open Xcode
2. Go to Settings → Platforms
3. Download desired iOS runtime (e.g., iOS 18.2)
4. Wait for download to complete

### Step 2: Clone and Build WebDriverAgent

```bash
# Clone WebDriverAgent
git clone https://github.com/appium/WebDriverAgent.git
cd WebDriverAgent

# Install dependencies
npm install

# Switch to Xcode (not CommandLineTools)
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# Build and run WebDriverAgent
xcodebuild -project WebDriverAgent.xcodeproj \
  -scheme WebDriverAgentRunner \
  -destination 'platform=iOS Simulator,name=iPhone 16 Plus' \
  test
```

### Step 3: Verify WebDriverAgent

Once running, you should see:
```
ServerURLHere->http://192.168.1.92:8100<-ServerURLHere
```

Test the connection:
```bash
curl http://192.168.1.92:8100/status
```

---

## Android Setup

### Prerequisites
- Android Studio installed
- Android SDK configured
- AVD (Android Virtual Device) created

### Step 1: Create AVD

1. Open Android Studio
2. Go to Tools → AVD Manager
3. Create Virtual Device
4. Select device definition and system image
5. Launch the emulator

### Step 2: Verify ADB Connection

```bash
# Check connected devices
adb devices

# Should show:
# List of devices attached
# emulator-5554  device
```

---

## Usage Examples

### Basic Operations in Claude Code

```javascript
// Taking a screenshot
await mobile_take_screenshot({ noParams: {} });

// Listing elements on screen
await mobile_list_elements_on_screen({ noParams: {} });

// Clicking an element
await mobile_click_on_screen_at_coordinates({ x: 195, y: 735 });

// Typing text
await mobile_type_keys({ text: "apple.com", submit: true });

// Swiping
await swipe_on_screen({ direction: "up" });
```

### Complete Workflow Example

```python
workflow = {
    'launch_app': {
        'step_1': 'Use default device or select specific one',
        'step_2': 'Launch target app',
        'step_3': 'Take screenshot for verification'
    },
    'interact': {
        'list_elements': 'Get all clickable elements',
        'click_element': 'Click by coordinates',
        'type_text': 'Enter text in fields',
        'navigate': 'Swipe or press buttons'
    },
    'validate': {
        'screenshot': 'Capture final state',
        'elements': 'Verify expected elements'
    }
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### WebDriverAgent Not Running
```yaml
problem: "Failed to connect to WebDriverAgent at http://localhost:8100"
solution:
  - Ensure WebDriverAgent is built and running
  - Check iOS Simulator is open
  - Verify the correct URL (may be IP address instead of localhost)
  - Rebuild WebDriverAgent if needed
```

#### No iOS Devices Available
```yaml
problem: "No iOS runtimes installed"
solution:
  - Open Xcode → Settings → Platforms
  - Download iOS runtime
  - Restart Simulator app
  - Create new device in Simulator
```

#### Xcode Path Issues
```yaml
problem: "xcode-select: error: tool 'xcodebuild' requires Xcode"
solution:
  command: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  verify: xcode-select -p
```

#### MCP Server Not Found
```yaml
problem: "MCP server 'mobile-mcp' not available"
solution:
  - Restart Claude Code
  - Check MCP configuration
  - Verify path to lib/index.js
  - Ensure npm build completed
```

---

## Advanced Configuration

### Custom Device Selection
```javascript
// List available devices
await mobile_list_available_devices({ noParams: {} });

// Use specific device
await mobile_use_device({
    device: "iPhone 15 Plus",
    deviceType: "simulator"
});
```

### Session Management
```javascript
// For Android devices
await mobile_use_device({
    device: "emulator-5554",
    deviceType: "android"
});

// For physical iOS devices
await mobile_use_device({
    device: "Your iPhone",
    deviceType: "ios"
});
```

---

## Performance Optimization

### Best Practices
```yaml
tips:
  element_detection:
    - Use list_elements_on_screen for precise interaction
    - Avoid screenshot-only navigation when possible
    - Cache element positions when stable
  
  automation_speed:
    - Keep WebDriverAgent running between sessions
    - Use coordinates for known positions
    - Batch operations when possible
  
  reliability:
    - Add waits after navigation
    - Verify element presence before interaction
    - Handle loading states explicitly
```

---

## Integration Patterns

### CI/CD Pipeline Integration
```yaml
github_actions:
  - Setup simulator in workflow
  - Run WebDriverAgent in background
  - Execute mobile-mcp tests
  - Capture screenshots for artifacts

local_development:
  - Keep simulator always running
  - WebDriverAgent as background service
  - Mobile-mcp available in Claude Code
```

### Multi-Device Testing
```python
test_matrix = {
    'ios_devices': [
        'iPhone 15 Plus',
        'iPhone 16 Pro',
        'iPad Pro'
    ],
    'android_devices': [
        'Pixel 8 Pro',
        'Samsung Galaxy S24'
    ],
    'test_scenarios': [
        'App launch',
        'Navigation flow',
        'Form submission',
        'Gesture interactions'
    ]
}
```

---

## Security Considerations

### Safe Practices
- Never automate sensitive apps without permission
- Avoid storing credentials in automation scripts
- Use test accounts for automation
- Clear app data between test runs

### Access Control
```yaml
restrictions:
  - WebDriverAgent only works with Simulator (not physical devices without setup)
  - Android requires developer mode enabled
  - Both require local machine access
  - No remote device control without additional setup
```

---

## Resources and References

### Official Documentation
- [Mobile MCP GitHub](https://github.com/mobile-next/mobile-mcp)
- [Mobile MCP Wiki](https://github.com/mobile-next/mobile-mcp/wiki)
- [WebDriverAgent](https://github.com/appium/WebDriverAgent)
- [MCP Specification](https://modelcontextprotocol.io)

### Related Tools
- Appium - Cross-platform mobile automation
- Maestro - Mobile UI testing framework
- XCUITest - Native iOS testing
- Espresso - Native Android testing

---

## Conclusion

Mobile MCP bridges the gap between AI assistants and mobile automation, enabling sophisticated mobile app testing and interaction workflows. With proper setup of WebDriverAgent for iOS and ADB for Android, Claude Code can effectively control and interact with mobile applications.

Key success factors:
1. **Proper Environment Setup** - Xcode, Android Studio, and simulators
2. **WebDriverAgent Running** - Critical for iOS automation
3. **MCP Configuration** - Correct paths and permissions
4. **Testing Approach** - Use accessibility trees over screenshots when possible

Expected outcome: Full mobile automation capabilities within Claude Code, enabling automated testing, app interaction, and mobile workflow development.

---

## Tags
#MobileAutomation #MCP #iOS #Android #WebDriverAgent #ClaudeCode #Testing #Automation

---

*Setup Guide Version: 1.0*  
*Date: 2025-01-04*  
*Environment: macOS with Xcode 16.2, iOS 18.2 Simulator*