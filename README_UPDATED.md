
### README

# Opis Aplikacji

Aplikacja to zestaw narzędzi wykorzystujących OpenAI API do analizy treści, generowania struktur HTML oraz wstawiania obrazów na podstawie treści artykułów. Główne funkcje obejmują:
- Odczyt treści z pliku tekstowego.
- Analizę głównego tematu artykułu.
- Generowanie kodu HTML z odpowiednimi strukturami i obrazami wstawianymi w odpowiednich miejscach.
- Zastępowanie placeholderów obrazów rzeczywistymi grafikami generowanymi przez AI.
- Tworzenie podglądu HTML w gotowym do użytku szablonie.

---

# Instrukcja Uruchomienia

1. **Wymagania systemowe**:
   - Node.js (v14 lub nowszy).
   - Konto w OpenAI z kluczem API.

2. **Instalacja**:
   - Upewnij się, że masz zainstalowane biblioteki wymagane przez skrypty:
     ```bash
     npm install openai
     ```

3. **Konfiguracja API Key**:
   - W plikach `dodatkowe.js` i `zad1.js` znajdź linijkę zawierającą zmienną `apiKey` i wprowadź tam swój klucz API OpenAI:
     ```javascript
     const apiKey = 'twój-klucz-API';
     ```

4. **Pliki wejściowe**:
   - `artykul.txt` – Plik z treścią artykułu, który będzie analizowany.

5. **Uruchomienie**:
   - Uruchom aplikację za pomocą Node.js:
     ```bash
     node dodatkowe.js
     ```
     lub
     ```bash
     node zad1.js
     ```

6. **Rezultaty**:
   - Wygenerowane pliki HTML zostaną zapisane w katalogu roboczym. Każdy plik otrzyma unikalną nazwę, aby uniknąć nadpisywania.
   - Plik podglądu (`podglad.html`) zostanie wygenerowany w przypadku uruchomienia `dodatkowe.js`.

7. **Komunikaty o błędach**:
   - Jeśli wystąpi błąd podczas odczytu pliku, generowania HTML lub wstawiania obrazów, aplikacja wyświetli odpowiedni komunikat w konsoli.

8. **Opcjonalne ustawienia**:
   - Możesz zmodyfikować nazwy plików wejściowych i wyjściowych, edytując zmienne `fileIn` i `fileOut` w skryptach.
