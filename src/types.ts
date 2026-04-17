export type Language = "polish" | "english";

export type GameMode =
  | "letters_to_sound"
  | "sound_to_letters"
  | "letters_to_letters";

export interface GameConfig {
  strings: string[];
  lang: Language;
}

export const LANGUAGE_LABEL: Record<Language, string> = {
  polish: "Polski",
  english: "English",
};

export const LANGUAGE_LOCALE: Record<Language, string> = {
  polish: "pl-PL",
  english: "en-US",
};

export const MODE_LABEL: Record<GameMode, string> = {
  letters_to_sound: "Litery → Dźwięk",
  sound_to_letters: "Dźwięk → Litery",
  letters_to_letters: "Litery → Litery",
};

export const MODE_DESCRIPTION: Record<GameMode, string> = {
  letters_to_sound:
    "Przeczytaj wyświetlony ciąg liter do mikrofonu. Gra rozpozna Twój głos.",
  sound_to_letters:
    "Posłuchaj wymowy i wybierz odpowiadający jej ciąg liter spośród czterech opcji.",
  letters_to_letters:
    "Dopasuj wyświetlony ciąg liter do jednej z czterech identycznych opcji.",
};
