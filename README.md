# <SamXode/> Typing Countdown Tracker

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A Tampermonkey userscript that tracks typing with a countdown timer specifically designed for Discord. This script helps you monitor your typing activity with a customizable countdown timer, typing counter, and modern UI.

## Features

- **Countdown Timer**: Configurable countdown that prevents typing until finished
- **Typing Counter**: Tracks the number of times you've typed
- **Modern UI**: Clean, animated interface with smooth transitions
- **Audio Notifications**: Customizable sound alerts for warnings and completions
- **Customizable Settings**: Adjust timer duration, sounds, volume, and UI position
- **Keyboard Shortcuts**: Use Arrow Up key to manually trigger countdown
- **Persistent Settings**: Your preferences are saved between sessions

## Screenshots

![Screenshot](https://arrow-wing-897.notion.site/image/attachment%3A2af1a36e-36b7-4d08-9ac7-8aba83d5ad87%3Aimage.png?table=block&id=1a5c089c-b470-8085-bc67-fd75decc1e6f&spaceId=12427a77-ab6b-4a2b-92db-1330e9dfdf1b&width=1420&userId=&cache=v2)

## Installation

1. **Install Tampermonkey**:
   - For [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - For [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - For [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
   - For [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)

2. **Install the Userscript**:
   - Click on the Tampermonkey icon in your browser
   - Select "Create a new script"
   - Delete any existing content
   - Copy and paste the entire script code
   - Press Ctrl+S or click File > Save to save the script

3. **Verify Installation**:
   - Navigate to Discord in your browser
   - You should see the Typing Countdown Tracker UI in the top-right corner (default position)

## Usage

### Basic Controls

- **Counter Reset**: Click the "Reset 🔄" button to reset the typing count and timer
- **Manual Trigger**: Click "Start Countdown ⏱️" or press the Arrow Up key to manually start the countdown
- **Settings**: Click "⚙️ Settings" to open the settings panel

### Settings Panel

Access a variety of customization options:

- **Countdown Duration**: Set the countdown time (5-600 seconds)
- **UI Position**: Choose from Top Right, Top Left, Bottom Right, or Bottom Left
- **Sound Effects**: Enable/disable audio notifications
- **Volume Control**: Adjust notification and warning volumes separately
- **Test Sounds**: Test notification and warning sounds before saving
- **Reset to Defaults**: Restore all default settings

### How It Works

1. When you start typing or manually trigger the countdown, a timer begins
2. During the countdown, a warning message appears
3. When the countdown completes, you'll receive a notification that you can type again
4. The typing count increments with each countdown cycle

## Customization

The script includes extensive customization options accessible through the settings panel:

- **Countdown Time**: Default is 60 seconds, adjustable from 5 to 600 seconds
- **Audio**: Enable/disable sounds and adjust volume levels
- **UI Position**: Adjust where the tracker appears on your screen

## Compatibility

This userscript is designed specifically for Discord web application. It should work across:

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Opera
- Other Chromium-based browsers with Tampermonkey support

## Troubleshooting

If you encounter issues:

- **Script not appearing**: Refresh the page or check if Tampermonkey is enabled
- **Sounds not working**: Check if sounds are enabled in the settings and if your browser allows audio
- **Settings not saving**: Make sure your browser allows localStorage access
- **UI elements misplaced**: Try changing the position in settings or refreshing the page

## Advanced Configuration

For advanced users who want to modify the script:

- **Default Settings**: You can modify the `DEFAULT_SETTINGS` object at the beginning of the script
- **CSS Styling**: Customize the appearance by editing the `GM_addStyle` section
- **Sound Resources**: Change the notification sounds by replacing the URL resources

## Developers

Created by **<SamXode/>**

## License

This project is available under the MIT License. Feel free to modify and distribute as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👤 Join Our Telegram Group!
Join our Telegram group for more bot scripts and discussions:
➡️ [Join Telegram Group](https://t.me/sam_xode)

## 💌 Contact
For questions or contributions, reach out via:
- **GitHub**: [sam-xode](https://github.com/sam-xode)
- **Twitter**: [@Sam_xode](https://twitter.com/Sam_xode)
- **Telegram**: [sam_xode](https://t.me/sam_xode)


## Changelog

### Version 1.0
- Initial release
- Countdown timer functionality
- Typing counter
- Settings panel
- Audio notifications
- Animated UI elements
- Keyboard shortcuts
