# Tempermonkey Script - ChatGPT Model Usage Monitor

This is a userscript that provides an elegant usage monitor for ChatGPT models, including daily quota tracking. It allows you to monitor the usage of different ChatGPT models in real-time, track daily limits, and configure model mappings and daily quotas.

![Image](https://github.com/user-attachments/assets/0c176427-0679-4f1d-aabc-c4b3c7b45701)

## Features

- **Real-time Model Usage Tracking**: Monitors the usage of different ChatGPT models in real-time.
- **Daily Quota Tracking**: Tracks daily usage limits for each model and resets the count at midnight.
- **Customizable Model Mappings**: Add, remove, and configure model mappings and daily limits.
- **Draggable UI**: The monitor UI is draggable and can be positioned anywhere on the screen.
- **Automatic Reset**: Automatically resets the daily usage count at midnight.
- **Progress Bars**: Visualizes the usage progress with color-coded progress bars.

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/).
2. Create a new script and paste the contents of this file into it.
3. Save the script and ensure it is enabled.

## Usage

- **Usage Tab**: Displays the current usage of each model, including the count, daily limit, and progress bar.
- **Settings Tab**: Allows you to add, remove, and configure model mappings and daily limits.

### Usage Tab

- **Model Name**: The name of the model.
- **Update**: The last time the model was used.
- **Usage**: The current usage count and daily limit.
- **Progress**: A progress bar showing the usage progress.

### Settings Tab

- **Model ID**: The internal ID of the model.
- **Daily Limit**: The daily usage limit for the model.
- **Delete Button**: Deletes the model mapping.

## Configuration

- **Default Models**: The script comes with default models (`o3-mini` and `o3-mini-high`) with predefined daily limits.
- **Add New Models**: You can add new models by clicking the "Add Model Mapping" button in the Settings tab.
- **Save Settings**: Click the "Save Settings" button to save any changes made in the Settings tab.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/tizee/tempermonkey-chatgpt-model-usage-monitor/blob/main/LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Author

[tizee](https://github.com/tizee)
