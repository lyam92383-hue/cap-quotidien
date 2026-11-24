# Cap Quotidien

Un site simple pour organiser ma journée : les 5 prières, le Coran, le sport, l'alimentation, les études (cybersécurité, réseau, électronique), Valorant et la routine.

## Onglets

- **Aujourd'hui** : le score du jour, les prières et l'avancement de chaque domaine
- **Foi** : prières avec horaires, pages de Coran, adhkar du matin et du soir
- **Sport** : la séance du jour selon le programme de la semaine, avec les charges
- **Alimentation** : calories, protéines, eau, poids
- **Études** : temps par matière et liste de tâches
- **Valorant** : routine d'entraînement, victoires et défaites, un point à travailler
- **Routine** : matin, soir, sommeil
- **Semaine** : le score des 7 derniers jours
- **Réglages** : objectifs, programme de sport, export et import des données

## Sur le téléphone

Le site s'installe comme une vraie appli, en plein écran, et marche **sans connexion** :

- **iPhone** (Safari) : Partager, puis « Sur l'écran d'accueil ».
- **Android** (Chrome) : menu ⋮, puis « Installer l'application ».

Sur téléphone, les onglets passent en bas de l'écran, et la page **Aujourd'hui** commence par des **actions rapides** : cocher la prochaine prière, ajouter un verre d'eau (+0,25 L), ajouter une page de Coran.

## Widget iPhone

Un widget gratuit avec l'appli **Scriptable** : la prochaine prière avec son compte à rebours, et (en taille moyenne) les 5 prières du jour. Toucher le widget ouvre l'onglet Foi.

1. Installe **Scriptable** depuis l'App Store.
2. Ouvre [`widget-iphone.js`](https://raw.githubusercontent.com/lyam92383-hue/cap-quotidien/main/widget-iphone.js) dans Safari, sélectionne tout le texte et copie-le.
3. Dans Scriptable, touche **+**, colle le script, puis nomme-le « Cap ».
4. Sur l'écran d'accueil : appui long, **+**, Scriptable, choisis la taille. Touche le widget, puis **Edit Widget**, **Script** : « Cap ».

Le widget lit `horaires.json` (mis à jour chaque nuit) et garde une copie sur le téléphone, donc il marche aussi sans réseau. Il ne montre pas le score, l'eau ni le Coran : ces données restent dans l'appli.

## Données

Tout est enregistré dans le navigateur (localStorage). Rien n'est envoyé sur internet.
Pour changer d'appareil ou faire une sauvegarde : Réglages, puis Exporter mes données.

Aucune dépendance : `index.html` (l'appli), `manifest.webmanifest` et `sw.js` (installation et mode hors-ligne), `icons/` (icônes).
