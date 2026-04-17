Tworzymy prostą grę w postaci web aplikacji. Bez backendu, tylko frontend który będzie mógł być hostowany na githubie jako github pages.
Gra polega dopasowywaniu ciągów liter do ich czytania, czytania do ciągów liter a także ciągów liter do ciągów liter.
Na pierwszym ekranie gra prosi o podanie listy ciągów liter i języku ich wymowy (do wyboru angielski i polski). Np. {strings: "pa,pe,pi,po,pu", lang: "polish"}. Następnie pozwala wybrać trzy z dostępnych trybów ćwiczenia:
* letters_to_sound - gra pokazuje na ekranie ciąg znaków np. "pa" a gracz musi do mikrofonu przeczytać ten ciąg. Jego głos jest transkrybowany i jeśli zgadza się z ciągiem znaków przechodzimy do kolejnego ciągu znaków.
* sound_to_letters - gra czyta używając syntezatora mowy dany ciąg znaków i pokazuje grid 2x2 dostępnych opcji np. czyta "pa" i pokazuje "pa", "pe", "pi", "po"
* letters_to_letters - gra pokazuje jakiś ciąg znaków na górze np. "pa" i daje do wyboru grid 2x2 dostępnych opcji - to proste ćwiczenie dla dzieci które dopiero uczą się rozpoznawać i kojarzyć litery

Ze względu na komponent audio gry będziemy musieli mieć jakieś biblioteki do czytania i transkrybcji które znają język polski i angielski oraz działają całkowicie na frontendzie. 
