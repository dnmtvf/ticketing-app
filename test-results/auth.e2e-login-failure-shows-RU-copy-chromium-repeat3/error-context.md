# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - heading "404" [level=1] [ref=e5]
    - heading "Not Found" [level=2] [ref=e6]
    - paragraph [ref=e7]: "[GET] \"/_nuxt/builds/meta/dev.json\": 404 Not Found"
    - link "Go back home" [ref=e9] [cursor=pointer]:
      - /url: /
  - generic:
    - img
  - generic:
    - generic:
      - generic:
        - button "Go to parent" [disabled]
        - button "Open in editor"
        - button "Close"
  - generic [ref=e10]:
    - button "Toggle Nuxt DevTools" [ref=e11] [cursor=pointer]:
      - img [ref=e12]
    - generic "App load time" [ref=e15]:
      - generic [ref=e16]: "1.1"
      - generic [ref=e17]: s
    - button "Toggle Component Inspector" [ref=e19] [cursor=pointer]:
      - img [ref=e20]
```