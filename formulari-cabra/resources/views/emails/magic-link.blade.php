<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>La Cabra d'Or 2026</title>
    <style>
        body { font-family: Georgia, serif; background: #faf7f2; margin: 0; padding: 0; color: #2c1810; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: #b85042; padding: 36px 40px; text-align: center; }
        .header h1 { margin: 0; color: #fff; font-size: 26px; letter-spacing: 0.5px; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
        .body { padding: 36px 40px; }
        .body p { line-height: 1.7; font-size: 15px; margin: 0 0 16px; }
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: #b85042; color: #fff !important; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 16px; font-family: Georgia, serif; font-weight: bold; letter-spacing: 0.3px; }
        .code-box { background: #faf7f2; border: 1px solid #e7ddd5; border-radius: 8px; padding: 16px 20px; text-align: center; margin: 24px 0; }
        .code-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a0896e; margin-bottom: 6px; }
        .code-box .code { font-size: 22px; font-weight: bold; letter-spacing: 3px; color: #b85042; font-family: 'Courier New', monospace; }
        .url-fallback { font-size: 12px; color: #a0896e; word-break: break-all; }
        .footer { background: #faf7f2; padding: 20px 40px; font-size: 12px; color: #a0896e; text-align: center; border-top: 1px solid #e7ddd5; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>🐐 La Cabra d'Or 2026</h1>
        <p>Accés a la teva inscripció</p>
    </div>

    <div class="body">
        <p>Hola, <strong>{{ $submission->full_name }}</strong>!</p>

        <p>Prem el botó següent per accedir a la teva inscripció. L'enllaç és vàlid durant <strong>1 hora</strong>.</p>

        <div class="btn-wrapper">
            <a href="{{ $magicLinkUrl }}" class="btn">Accedeix a la meva inscripció →</a>
        </div>

        <div class="code-box">
            <div class="label">El teu codi d'accés</div>
            <div class="code">{{ $submission->access_code }}</div>
        </div>

        <p>Si el botó no funciona, copia aquest enllaç al teu navegador:</p>
        <p class="url-fallback">{{ $magicLinkUrl }}</p>

        <p style="margin-top: 24px; font-size: 13px; color: #a0896e;">
            Si no has demanat aquest accés, pots ignorar aquest correu.
        </p>
    </div>

    <div class="footer">
        <p>La Cabra d'Or 2026 · Formulari de participació</p>
    </div>
</div>
</body>
</html>
