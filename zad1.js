const fs = require('fs');
const { OpenAI } = require('openai');
const apiKey = ''; // Umieść swój klucz API tutaj
const fileIn = 'artykul.txt';
let fileOut = 'artykul.html';

const artiRead = () => {
    try {
        return fs.readFileSync(fileIn, 'utf8');
    } catch (error) {
        console.error('Bład nie można odczytać pliku : ' , error);
        process.exit(1);
    }
};
const generateHtml = async (artiContent) => {
    try {
        const openai = new OpenAI({
            apiKey: apiKey,
        });
        const newChat = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{
                role: 'user',
                content: `Kod artykułu wygenerowany przez AI powinien spełniać następujące wytyczne:
• Użycie odpowiednich tagów HTML do strukturyzacji treści.
• Określenie wspólnie z AI miejsc, gdzie warto wstawić grafiki – oznaczamy je z użyciem
tagu <img> z atrybutem src="image_placeholder.jpg". Dodaj atrybut alt do
każdego obrazka z dokładnym promptem, który możemy użyć do wygenerowania grafiki.
Umieść podpisy pod grafikami używając odpowiedniego tagu HTML.
• Brak kodu CSS ani JavaScript. Zwrócony kod powinien zawierać wyłącznie zawartość do
wstawienia pomiędzy tagami <body> i </body>. Nie dołączaj znaczników <html>,
<head> ani <body>.
                ${artiContent}`
            }],
            max_tokens: 3000,
            temperature: 0.7,
        });
        return newChat.choices[0].message.content;
    } catch (error) {
        console.error('Nie można wygenerować pliku z OpenAI:', error.statusText ? error.statusText : error.message);
        process.exit(1);
    }
};
const save  = (textHtml) => {
    try {
        if (fs.existsSync(fileOut)) {
            let htmlIndex = 1;
            while (fs.existsSync(`artykul${htmlIndex}.html`)) {
                htmlIndex++;
            }
            fileOut = `artykul${htmlIndex}.html`;
        }
        fs.writeFileSync(fileOut, textHtml)
        console.log(`plik zostal zapisany jako ${fileOut}`);
    } catch (error) {
        console.error('Błąd przy zapisie', error);
        process.exit(1);
    }
};
const main = async () => {
    const content = artiRead();
    const textHtml = await generateHtml(content);
    save(textHtml);
};
main();