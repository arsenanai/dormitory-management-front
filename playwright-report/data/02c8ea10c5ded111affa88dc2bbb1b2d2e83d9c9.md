# Page snapshot

```yaml
- text: Language
- combobox "Language":
  - option "English" [selected]
  - option "Қазақша"
  - option "Русский"
- tablist:
  - tab "Login" [selected]
  - tab "Registration"
  - tab "Guests"
- tabpanel:
  - text: Email*
  - textbox "Email*": alice@student.local
  - text: Password*
  - textbox "Password*": password
  - button "Login"
  - button "Forgot your password?"
- img
- img
- alert:
  - paragraph: Login failed
  - button "Close"
```