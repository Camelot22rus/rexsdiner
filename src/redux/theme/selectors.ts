import { RootState } from "../store";

export const selectTheme = (state: RootState) => state.theme;
export const selectIsDarkMode = (state: RootState) => state.theme.isDarkMode;
