import type { Decorator, Preview } from "@storybook/react-webpack5";
import { ThemeProvider, createTheme, CssBaseline, StyledEngineProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const muiCache = createCache({
  key: "mui",
  prepend: true,
});

const theme = createTheme();

const withMuiTheme: Decorator = Story => {
  return (
    <CacheProvider value={muiCache}>
      <StyledEngineProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ padding: "20px", minHeight: "100vh" }}>
            <Story />
          </div>
        </ThemeProvider>
      </StyledEngineProvider>
    </CacheProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
  },
  decorators: [withMuiTheme],
};

export default preview;
