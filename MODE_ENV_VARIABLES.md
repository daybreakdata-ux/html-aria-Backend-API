# Mode Configuration - Environment Variables

System prompts and models for each mode are now configured via Vercel environment variables. Each mode has its own system prompt, model, and temperature settings.

## Required Environment Variables

### Default Mode
- `MODE_DEFAULT_SYSTEM_PROMPT` - System prompt for default mode
- `MODE_DEFAULT_MODEL` - Model to use for default mode (default: `cognitivecomputations/dolphin-mistral-24b-venice-edition:free`)
- `MODE_DEFAULT_TEMPERATURE` - Temperature for default mode (default: `0.7`)

### Creative Mode
- `MODE_CREATIVE_SYSTEM_PROMPT` - System prompt for creative mode
- `MODE_CREATIVE_MODEL` - Model to use for creative mode
- `MODE_CREATIVE_TEMPERATURE` - Temperature for creative mode (default: `1.2`)

### Precise Mode
- `MODE_PRECISE_SYSTEM_PROMPT` - System prompt for precise mode
- `MODE_PRECISE_MODEL` - Model to use for precise mode
- `MODE_PRECISE_TEMPERATURE` - Temperature for precise mode (default: `0.3`)

### Coder Mode
- `MODE_CODER_SYSTEM_PROMPT` - System prompt for coder mode (default: "You are an expert software engineer. Provide clear, concise code solutions with explanations.")
- `MODE_CODER_MODEL` - Model to use for coder mode
- `MODE_CODER_TEMPERATURE` - Temperature for coder mode

### Analyst Mode
- `MODE_ANALYST_SYSTEM_PROMPT` - System prompt for analyst mode (default: "You are a data analyst. Provide detailed analysis with insights and recommendations.")
- `MODE_ANALYST_MODEL` - Model to use for analyst mode
- `MODE_ANALYST_TEMPERATURE` - Temperature for analyst mode

## Example Configuration

```env
# Default Mode
MODE_DEFAULT_SYSTEM_PROMPT="You are ARIA, a helpful AI assistant created by Daybreak Data."
MODE_DEFAULT_MODEL="cognitivecomputations/dolphin-mistral-24b-venice-edition:free"
MODE_DEFAULT_TEMPERATURE="0.7"

# Creative Mode
MODE_CREATIVE_SYSTEM_PROMPT="You are a creative writing assistant. Be imaginative and expressive."
MODE_CREATIVE_MODEL="openai/gpt-4"
MODE_CREATIVE_TEMPERATURE="1.2"

# Precise Mode
MODE_PRECISE_SYSTEM_PROMPT="You are a precise, factual assistant. Provide accurate, well-researched answers."
MODE_PRECISE_MODEL="anthropic/claude-3-opus"
MODE_PRECISE_TEMPERATURE="0.3"

# Coder Mode
MODE_CODER_SYSTEM_PROMPT="You are an expert software engineer. Provide clear, concise code solutions with explanations."
MODE_CODER_MODEL="meta-llama/llama-3.1-70b-instruct"
MODE_CODER_TEMPERATURE="0.7"

# Analyst Mode
MODE_ANALYST_SYSTEM_PROMPT="You are a data analyst. Provide detailed analysis with insights and recommendations."
MODE_ANALYST_MODEL="google/gemini-pro"
MODE_ANALYST_TEMPERATURE="0.7"
```

## Setting Up in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable for the modes you want to configure
4. Set for Production, Preview, and Development environments as needed
5. Redeploy your application

## Notes

- If a mode's system prompt is not set, it will fall back to the default mode's system prompt
- If a mode's model is not set, it will use the default model
- Temperature defaults are provided but can be overridden
- Each mode is completely independent - you can use different models and prompts for each

