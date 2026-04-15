# 🤖 Configuração de Backup Automático na Nuvem

## Opções de Hospedagem de Backup

Existem várias plataformas onde podemos armazenar backups automaticamente:

---

## 1️⃣ Google Drive (Recomendado - Grátis)

### Vantagens:
- ✅ Conta Google inclusa (cliente provavelmente tem)
- ✅ 15GB grátis
- ✅ Sincronização automática
- ✅ Fácil compartilhamento
- ✅ Interface visual intuitiva

### Como Configurar:

```javascript
// backend/src/services/GoogleDriveBackup.js
const { google } = require('googleapis');
const fs = require('fs');

class GoogleDriveBackup {
  constructor(credentials) {
    this.auth = new google.auth.GoogleAuth({
      keyFile: credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  async uploadBackup(filePath, fileName) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: ['pasta-id-do-backup']
      };

      const media = {
        mimeType: 'application/json',
        body: fs.createReadStream(filePath)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink'
      });

      return {
        fileId: response.data.id,
        link: response.data.webViewLink
      };
    } catch (error) {
      console.error('Erro ao upload para Drive:', error);
      throw error;
    }
  }

  async listBackups(limit = 10) {
    try {
      const response = await this.drive.files.list({
        q: "mimeType='application/json' and trashed=false",
        spaces: 'drive',
        fields: 'files(id, name, createdTime, size)',
        pageSize: limit,
        orderBy: 'createdTime desc'
      });

      return response.data.files;
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      throw error;
    }
  }

  async downloadBackup(fileId, outputPath) {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(outputPath))
          .on('finish', resolve)
          .on('error', reject);
      });
    } catch (error) {
      console.error('Erro ao download:', error);
      throw error;
    }
  }
}

module.exports = GoogleDriveBackup;
```

### Variáveis de Ambiente:
```env
GOOGLE_DRIVE_API_KEY=sua-chave-api
GOOGLE_DRIVE_FOLDER_ID=id-da-pasta-backup
GOOGLE_DRIVE_UPLOAD_ENABLED=true
```

---

## 2️⃣ AWS S3 (Profissional)

### Vantagens:
- ✅ Altamente escalável
- ✅ Segurança de nível empresarial
- ✅ Versionamento automático
- ✅ Replicação multi-região

### Custo Estimado:
- Primeiros 5 GB: Grátis (free tier)
- Depois: ~$0.023/GB/mês

### Implementação:

```javascript
// backend/src/services/S3Backup.js
const AWS = require('aws-sdk');
const fs = require('fs');

class S3Backup {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucket = process.env.AWS_BACKUP_BUCKET;
  }

  async uploadBackup(filePath, fileName) {
    try {
      const fileContent = fs.readFileSync(filePath);

      const params = {
        Bucket: this.bucket,
        Key: `backups/${new Date().getFullYear()}/${fileName}`,
        Body: fileContent,
        ContentType: 'application/json',
        ServerSideEncryption: 'AES256'
      };

      const result = await this.s3.upload(params).promise();
      return result;
    } catch (error) {
      console.error('Erro ao upload S3:', error);
      throw error;
    }
  }

  async listBackups(limit = 10) {
    try {
      const params = {
        Bucket: this.bucket,
        Prefix: 'backups/',
        MaxKeys: limit
      };

      const result = await this.s3.listObjectsV2(params).promise();
      return result.Contents;
    } catch (error) {
      console.error('Erro ao listar S3:', error);
      throw error;
    }
  }
}

module.exports = S3Backup;
```

---

## 3️⃣ Dropbox (Simples)

### Vantagens:
- ✅ 2GB grátis
- ✅ Sincronização automática
- ✅ Versioning nativo
- ✅ Fácil de usar

### Implementação Simples:

```javascript
// backend/src/services/DropboxBackup.js
const fetch = require('node-fetch');
const fs = require('fs');

class DropboxBackup {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://content.dropboxapi.com/2/files';
  }

  async uploadBackup(filePath, fileName) {
    try {
      const fileContent = fs.readFileSync(filePath);

      const response = await fetch(`${this.baseUrl}/upload_v2/staging_get_upload_url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      // ... resto da implementação

      return { success: true };
    } catch (error) {
      console.error('Erro ao upload Dropbox:', error);
      throw error;
    }
  }
}

module.exports = DropboxBackup;
```

---

## ⚙️ Integração com Seu Sistema

### Opção 1: Upload Automático após Backup

```javascript
// Modificar BackupService.js
static async scheduleAutoBackup() {
  const schedule = require('node-schedule');
  const GoogleDriveBackup = require('./GoogleDriveBackup');
  
  schedule.scheduleJob('0 3 * * *', async () => {
    try {
      // 1. Criar backup local
      const backupData = await this.createFullBackup();
      const backupInfo = await this.saveBackupToFile(backupData);
      
      // 2. Upload para Google Drive
      if (process.env.GOOGLE_DRIVE_ENABLED === 'true') {
        const driveBackup = new GoogleDriveBackup(
          process.env.GOOGLE_DRIVE_CREDENTIALS
        );
        await driveBackup.uploadBackup(
          backupInfo.filepath,
          backupInfo.filename
        );
        console.log('✅ Backup enviado para Google Drive');
      }
      
      // 3. Upload para AWS S3
      if (process.env.AWS_ENABLED === 'true') {
        const s3Backup = new S3Backup();
        await s3Backup.uploadBackup(
          backupInfo.filepath,
          backupInfo.filename
        );
        console.log('✅ Backup enviado para AWS S3');
      }
      
    } catch (error) {
      console.error('❌ Erro no backup automático:', error);
    }
  });
}
```

### Opção 2: Incluir nas Rotas

```javascript
// backend/src/routes/backupRoutes.js
// Novo endpoint: fazer upload manual à nuvem

router.post('/upload-cloud/:filename', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;
    const { provider = 'drive' } = req.body; // 'drive', 's3', 'dropbox'

    if (provider === 'drive') {
      const backup = new GoogleDriveBackup(process.env.GOOGLE_DRIVE_CREDENTIALS);
      const result = await backup.uploadBackup(filepath, filename);
      res.json({ success: true, data: result });
    }
    // ... outros providers
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});
```

---

## 🔐 Segurança de Credenciais

### Nunca faça:
```javascript
❌ credentials = {
  "type": "service_account",
  "project_id": "xxx",
  "private_key": "xxx" // NUNCA comitar isso!
}
```

### Em vez disso:
```javascript
// .env
GOOGLE_DRIVE_CREDENTIALS=/path/to/credentials.json
AWS_ACCESS_KEY_ID=seu_id
AWS_SECRET_ACCESS_KEY=sua_chave

// .gitignore
credentials.json
.env
```

---

## 📊 Comparação de Plataformas

| Plataforma | Grátis | Custo | Setup | Segurança |
|-----------|--------|-------|-------|-----------|
| **Google Drive** | 15GB | $100/1TB | ⭐⭐ Fácil | ⭐⭐⭐⭐ |
| **AWS S3** | 5GB | $0.023/GB | ⭐⭐⭐ Moderado | ⭐⭐⭐⭐⭐ |
| **Dropbox** | 2GB | $120/1TB | ⭐⭐ Fácil | ⭐⭐⭐⭐ |
| **Local** | Ilimitado | Espaço | ⭐ Grátis | ⭐⭐ |

---

## 🚀 Implementação Recomendada (Melhor Custo/Benefício)

```
PARA SUA CLIENTE:

├─ Backup Local
│  └─ Diariamente às 3 AM (GRÁTIS)
│
├─ Google Drive (Automático)
│  └─ Cópia redundante no Drive dela (GRÁTIS)
│
└─ Exportação Manual
   ├─ CSV para Excel (quando quiser)
   └─ JSON para segurança extra
```

### Por quê?
- ✅ Google Drive grátis (cliente já tem conta)
- ✅ Backup automático (não precisa fazer nada)
- ✅ Acesso fácil (Drive é intuitivo)
- ✅ Sincronização em tempo real (seguro)
- ✅ Sem custo adicional

---

## 📋 Passo a Passo: Implementar Google Drive

### 1. Criar Credenciais
```bash
# https://console.cloud.google.com/

1. Criar novo projeto
2. Ativar Google Drive API
3. Criar credenciais (Service Account)
4. Download JSON
5. Salvar como credentials.json
```

### 2. Instalar Dependência
```bash
npm install googleapis google-auth-library
```

### 3. Adicionar ao Backend
```javascript
// No server.js
const GoogleDriveBackup = require('./services/GoogleDriveBackup');

// Na inicialização
if (process.env.GOOGLE_DRIVE_ENABLED === 'true') {
  const driveBackup = new GoogleDriveBackup(
    process.env.GOOGLE_DRIVE_CREDENTIALS_PATH
  );
  console.log('✅ Google Drive Backup ativado');
}
```

### 4. Testar
```bash
npm run test:backup

# Deve criar um arquivo de backup e enviar para Google Drive
```

---

## 🎯 Próximas Etapas para Sua Cliente

1. **Semana 1**: Teste backup local
2. **Semana 2**: Ative Google Drive
3. **Semana 3**: Teste restauração
4. **Semana 4**: Rotina consolidada

---

## 📞 Suporte para Setup

Se precisar de ajuda:
```
📧 Email: dev@carolinanaildesign.com
💬 Slack: #backup-setup
```

---

**Última atualização**: Abril de 2026
