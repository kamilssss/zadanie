const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const apiKey = ''; // Umieść swój klucz API tutaj
const fileIn = 'artykul.txt';
let fileOut = 'artykul.html';

const artiRead = () => {
    try {
        return fs.readFileSync(fileIn, 'utf8');
    } catch (error) {
        console.error('Błąd: nie można odczytać pliku:', error);
        process.exit(1);
    }
};

const findArticleTopic = async (artiContent) => {
    const openai = new OpenAI({
        apiKey: apiKey,
    });
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{
            role: 'user',
            content: `Na podstawie poniższego artykułu zwróć jednozdaniowy opis głównego tematu. 
Artykuł:
${artiContent}`
        }],
        max_tokens: 50,
    });
    return response.choices[0].message.content.trim();
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
                content: `Użycie odpowiednich tagów HTML do strukturyzacji treści.
                    • Określenie wspólnie z AI miejsc, gdzie warto wstawić grafiki – oznaczamy je z użyciem tagu <img> z atrybutem src="image_placeholder.jpg". Dodaj atrybut alt do każdego obrazka z dokładnym promptem, który możemy użyć do wygenerowania grafiki.
                    • Umieść podpisy pod grafikami używając odpowiedniego tagu HTML.
                    • Brak kodu CSS ani JavaScript. Zwrócony kod powinien zawierać wyłącznie zawartość do wstawienia pomiędzy tagami <body> i </body>. Nie dołączaj znaczników <html>, <head> ani <body>.
                    
                    Artykuł: 
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

const generateImage = async (prompt, articleTopic) => {
    const finalPrompt = `${articleTopic}, ${prompt}. Realistic, high-quality, hyper-realistic image, no text, no people, no logos, no labels, without any signs or written characters.`;
    try {
        const openai = new OpenAI({
            apiKey: apiKey,
        });
        const response = await openai.images.generate({
            prompt: finalPrompt,
            n: 1,
            size: "1024x1024",
        });
        const imageUrl = response.data[0].url;
        return imageUrl;
    } catch (error) {
        console.error(`Nie udało się wygenerować obrazu dla promptu "${finalPrompt}":`, error.message);
        return "image_placeholder.jpg"; // Jeśli nie uda się wygenerować, pozostawiamy placeholder
    }
};

const replacePlaceholdersWithImages = async (html, articleTopic) => {
    const imgRegex = /<img src="image_placeholder.jpg" alt="([^"]+)">/g;
    let match;
    const promises = [];

    while ((match = imgRegex.exec(html)) !== null) {
        const prompt = match[1];
        const imgTag = match[0]; // pełen znacznik <img> z placeholderem

        const promise = generateImage(prompt, articleTopic).then((imageUrl) => {
            html = html.replace(imgTag, `<img src="${imageUrl}" alt="${prompt}">`);
        }).catch((error) => {
            console.error(`Błąd przy generowaniu obrazu dla promptu "${prompt}": ${error.message}`);
        });

        promises.push(promise);
    }

    await Promise.all(promises);
    return html;
};

const save = (textHtml) => {
    try {
        if (fs.existsSync(fileOut)) {
            let indexPliku = 1;
            while (fs.existsSync(`artykul${indexPliku}.html`)) {
                indexPliku++;
            }
            fileOut = `artykul${indexPliku}.html`;
        }
        fs.writeFileSync(fileOut, textHtml);
        console.log(`Plik został zapisany jako ${fileOut}`);
    } catch (error) {
        console.error('Błąd przy zapisie:', error);
        process.exit(1);
    }
};

const generatePreview = async (textHtml) => {
    try {
        const szablonPath = path.join(__dirname, 'szablon.html');
        const szablonHtml = fs.readFileSync(szablonPath, 'utf8');

        const startTag = '<div class="container">';
        const endTag = '</div>';
        const startIdx = szablonHtml.indexOf(startTag) + startTag.length;
        const endIdx = szablonHtml.indexOf(endTag, startIdx);

        if (startIdx === -1 || endIdx === -1) {
            console.error('Nie znaleziono kontenera w szablonie.');
            process.exit(1);
        }

        const previewHtml = szablonHtml.slice(0, startIdx) + textHtml + szablonHtml.slice(endIdx);

        fs.writeFileSync('podglad.html', previewHtml);
        console.log('Plik podglad.html został wygenerowany i zapisany.');
    } catch (error) {
        console.error('Błąd przy generowaniu podglądu:', error);
        process.exit(1);
    }
};

const main = async () => {
    const artiContent = artiRead();
    console.log("Treść artykułu została wczytana.");
    const articleTopic = await findArticleTopic(artiContent);
    console.log(`Temat artykułu: ${articleTopic}`);

    let textHtml = await generateHtml(artiContent);
    console.log("HTML artykułu został wygenerowany.");

    // Zamień placeholdery na rzeczywiste obrazy z odpowiednimi promptami
    textHtml = await replacePlaceholdersWithImages(textHtml, articleTopic);
    console.log("Placeholdery obrazów zostały zamienione na wygenerowane obrazy.");

    save(textHtml);
    console.log("HTML artykułu został zapisany.");

    await generatePreview(textHtml);
    console.log("Podgląd artykułu został wygenerowany i zapisany.");
};

main();
