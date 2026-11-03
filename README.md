# InspeksjonsVakt v1.1.0

En enkel, mobilvennlig webapp for å finne neste inspeksjon på skolen.

## Nytt i v1.1.0\n- Personlig ukeplan med inspeksjoner mandag–søndag.\n- Naviger mellom uker, eller gå tilbake til denne uken.\n- «Din neste inspeksjon» vises separat øverst.\n\n## Kom i gang
1. Pakk ut ZIP-filen.
2. Åpne `index.html` i en nettleser, eller publiser mappen via GitHub Pages.
3. Last opp skolens PDF-inspeksjonsplan.
4. Kontroller/juster avleste inspeksjoner i tabellen.
5. Lagre planen, velg navnet ditt og trykk stjernen for favoritt.

## Publisering via GitHub Pages
- Opprett et GitHub-repository.
- Last opp alle filene i denne mappen til repositoryets rot.
- Gå til **Settings → Pages**.
- Velg **Deploy from a branch**, `main` og `/ (root)`.
- Lagre. GitHub gir deg publiseringsadressen.

## Viktig om PDF
PDF-tekst blir hentet med PDF.js via CDN, så første opplasting krever internettilgang.
PDF-er som består av skannede bilder uten tekstlag, eller tabeller med komplisert oppsett,
kan ikke tolkes pålitelig i denne første versjonen. Brukeren kan rette og legge inn rader
manuelt. Ikke legg inn elevopplysninger eller andre sensitive data.

## Data og begrensninger
- Inspeksjonsplan og favoritt lagres lokalt i nettleseren på enheten.
- Dette er ikke en delt løsning: hver enhet må få lastet inn samme plan.
- Første parser er en forsiktig tekstbasert prøve, ikke en fullverdig OCR-/tabellgjenkjenner.
- Versjon: 1.0.0
