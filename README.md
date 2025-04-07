# Weather Assistant

AI-powered weather assistant using Next.js and OpenAI. This application provides weather information and forecasts through a natural language interface.

## Features

- Real-time weather information
- Weather forecasts up to 5 days
- Natural language processing with GPT-4
- Geolocation support
- Responsive design with Tailwind CSS

## Tech Stack

- Next.js
- React
- OpenAI API
- OpenWeather API
- Tailwind CSS

## Setup

1. Clone the repository:
```bash
git clone https://github.com/godzkaya/weather-assistant.git
cd weather-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
- Get OpenWeather API key from [OpenWeather](https://openweathermap.org/api)
- Get OpenAI API key from [OpenAI](https://platform.openai.com/)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Support

To run with Docker:

```bash
docker-compose up --build
```

## License

MIT