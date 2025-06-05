# FluentC N8N Plugin

This N8N community plugin provides integration with the FluentC AI Translation API, enabling you to translate text and HTML content and detect languages within your N8N workflows.

## Features

- **Translation**: Support for both real-time and batch translation modes
- **Language Detection**: Detect the language of input content
- **Dynamic Language Selection**: Dropdown menus populated with your API key's enabled languages
- **Format Support**: Handle both text and HTML content
- **Automatic Polling**: Batch jobs are automatically polled until completion
- **Comprehensive Output**: Returns all metadata including token counts, detected languages, and model information
- **Error Handling**: Graceful error handling with continue-on-fail support
- **Language Management**: Direct link to manage enabled languages on your account

## Installation

1. Install the plugin in your N8N instance:
```bash
npm install n8n-nodes-fluentc
```

2. Restart your N8N instance

3. The FluentC nodes will appear in your node palette under the "Transform" category

## Setup

### 1. Create FluentC API Credentials

1. In N8N, go to **Credentials** > **New**
2. Search for "FluentC API" and select it
3. Enter your FluentC API key (obtained from the FluentC sales website)
4. Test and save the credential

### 2. Using the Nodes

#### FluentC Translate Node

This node handles text and HTML translation with support for both real-time and batch modes.

**Parameters:**
- **Mode**: Choose between "Real-time" (synchronous) or "Batch" (asynchronous)
- **Input**: Text or HTML content to translate (max 100,000 bytes)
- **Input Format**: Select "Text" or "HTML"
- **Target Language**: Dropdown populated with your enabled target languages
- **Source Language**: Dropdown with your enabled source languages (optional, includes "Auto-detect")
- **Max Polling Attempts**: (Batch mode only) Maximum polling attempts for batch jobs (default: 30)

**Language Management:**
The language dropdowns are dynamically populated based on your API key's enabled languages. If you need additional languages, you'll see a link to visit www.fluentc.io to manage your language access.

**Output:**
The node returns all available data including:
- `translation`: The translated content
- `token_count`: Number of tokens used
- `source_language_detected`: Detected source language
- `model_used`: AI model used for translation
- `metadata`: Additional metadata
- `mode`: Translation mode used
- `input_format`: Input format processed
- `target_language`: Target language

#### FluentC Check Language Node

This node detects the language of input content.

**Parameters:**
- **Input**: Text or HTML content to analyze
- **Input Format**: Select "Text" or "HTML"

**Output:**
- `detected_language`: Two-letter language code of detected language
- `confidence`: Confidence score (0-1) for the detection
- `input_format`: Input format processed
- `input_length`: Length of analyzed content

## Usage Examples

### Basic Translation Workflow

1. Add a **FluentC Translate** node to your workflow
2. Configure it with:
   - Mode: "Real-time"
   - Input: "Hello, how are you today?"
   - Input Format: "Text"
   - Target Language: Select "Spanish (es)" from dropdown
3. The output will include the Spanish translation and metadata

### Batch Translation for Large Content

1. Use **FluentC Translate** node with:
   - Mode: "Batch"
   - Input: Your large HTML or text content
   - Target Language: Your desired language code
2. The node will automatically poll until the translation is complete

### Language Detection Before Translation

1. Add a **FluentC Check Language** node first
2. Connect it to a **FluentC Translate** node
3. Use the detected language as the source language parameter

## Error Handling

The plugin includes comprehensive error handling:

- **Content Size Validation**: Prevents requests exceeding 100,000 bytes
- **Batch Timeout Protection**: Limits polling attempts to prevent infinite loops  
- **API Error Handling**: Gracefully handles API errors and rate limits
- **Continue on Fail**: Option to continue workflow execution even if translation fails

## API Rate Limits

The plugin respects FluentC API rate limits and uses the recommended polling intervals returned by the batch API to avoid overwhelming the service.

## Support

For issues related to this N8N plugin, please check:

1. **FluentC API Documentation**: https://fluentc.ai/docs
2. **N8N Community**: https://community.n8n.io
3. **Plugin Repository**: https://github.com/fluentc/n8n-nodes-fluentc

## License

MIT License - see LICENSE file for details.

---

**Note**: You need a valid FluentC API key to use this plugin. API keys are obtained through the FluentC sales website.