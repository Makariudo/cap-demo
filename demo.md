Commandes:
npm install -g @playwright/cli@latest
playwright-cli --help
playwright-cli install --skills


Prompt 1:
@beautifulMentionje voudrais dans un premier temps que tu me lances mon application et que tu snapshot ma page via playwirght-cli pour générer notre AOM @mcp:context7: @mcp:playwright:

Prompt 2:
Start l'application
Rentre une vma de 20km/h
Clique sur Enable color mode
Configure l'affichage des allures pour avoir une allure min de 2:00/km et une allure max de 4:00/km et un intervalle de 1s
Et produit les bonnes assertions pour valider que les couleurs sont bien appliquées et que les allures sont bien calculées
Ce test a pour but de valider ces fonctionnalités et éviter toutes régressions futures


Prompt 3:
Je voudrais maintenant que tu me génères un golden test pour valider qu'avec la configuration suivante:
- VMA de 20km/h
- Color mode activé
- Allure min de 2:00/km
- Allure max de 4:00/km
- Intervalle de 1s

Les allures sont bien calculées et les couleurs sont bien appliquées pour les distances 3km, 5km et 10km (ex: 3:34/km est en vert, 3:18/km est en rouge)
Ce test a pour but de valider ces fonctionnalités et éviter toutes régressions futures



Prompt4:
rajoute bien l'assertion avec la bonne couleur dans notre config précédente la ligne 3'18 devrait être rouge vif tandis que la 3'34 devrait être vert clair concernant la distance 10km et il y a donc un dégradé de couleur des background des allures entre ces deux valeurs. Je veux donc les bonnes assertions sur ces couleurs.