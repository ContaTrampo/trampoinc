
## Plano de Implementação - TalentMatch Completo

### Fase 1: Banco de Dados (imediato)
1. **Popular 200 perguntas + 600 opções** com vetores de peso realistas
2. **Corrigir bug** da criação de empresa no cadastro de recrutador
3. **Criar tabela `youtube_links`** para vídeos gerenciados pelo admin
4. **Criar tabela `testimonials`** para depoimentos

### Fase 2: Páginas Faltantes
5. **Página Rotas (`/routes`)** - Mapa Leaflet/OpenStreetMap com localização da entrevista, estimativa Uber (simulada por distância), linhas de ônibus (simuladas), horários
6. **Página Premium (`/premium`)** - Benefícios, comparação Free vs Premium, upgrade
7. **Página Suporte (`/support`)** - FAQ, formulário de contato
8. **Sidebar YouTube** - Links de vídeos educativos (como melhorar currículo, se portar em entrevista)

### Fase 3: Melhorias nas Páginas Existentes
9. **Home** - Depoimentos, seção "Como funciona" melhorada
10. **Perfil** - Parsing de currículo com IA (Lovable AI Gateway)
11. **Admin** - CRUD de vagas, gerenciar vídeos YouTube, gerenciar depoimentos
12. **Recrutador** - Formulário completo de vaga (responsabilidades, requisitos, formação, faixa etária, benefícios), botão "Chamar para entrevista" com email

### Fase 4: Integrações
13. **Vagas externas** - Adzuna API (gratuita) para buscar vagas reais
14. **Email personalizado** - Confirmação de candidatura e convite para entrevista
15. **Facebook Login** - OAuth (requer App ID do Facebook)

### Limitações técnicas:
- **WhatsApp**: Não há API gratuita oficial. Implementaremos link `wa.me` para abrir conversa
- **Scraping de sites**: Não é possível no frontend. Usaremos Adzuna API como fonte externa
- **Facebook Login**: Não suportado nativamente no Lovable Cloud. Alternativa: Google OAuth
- **Uber/Ônibus**: Preços e rotas serão simulados (não há API gratuita oficial)

### Admin:
- URL: `/admin` (oculta, sem link no menu)
- Email: `admin@sistema.com`
