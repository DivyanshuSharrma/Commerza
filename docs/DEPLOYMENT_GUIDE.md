# Commerza Production Deployment Guide

This guide covers zero-downtime containerized production deployment of Commerza on any standard Linux VPS, cloud instance (AWS EC2, DigitalOcean, Hetzner), or Docker-compatible host.

---

## 1. Prerequisites

- A VPS with Ubuntu 22.04+ or Debian 12 (Minimum 2GB RAM, 1 vCPU recommended).
- A domain name pointing to your VPS public IP (A Record: `@` and `*` or `store`).
- Docker Engine & Docker Compose V2 installed:
  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  ```

---

## 2. One-Click Deployment (Recommended)

1. **Clone Repository on your Server**:
   ```bash
   git clone https://github.com/divyanshubochiwal04/Commerza.git
   cd Commerza
   ```

2. **Configure Production Secrets**:
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```
   Set strong passwords for `DB_PASSWORD`, `DB_ROOT_PASSWORD`, and generate a 64-character `JWT_SECRET`.

3. **Execute One-Click Deploy Script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

The script will automatically:
- Build optimized multi-stage images for NestJS and Next.js.
- Spin up MySQL 8.0 and Redis 7 with persistent volumes.
- Wait for database healthchecks to report healthy.
- Synchronize Prisma schema tables.
- Start the Nginx reverse proxy on port 80.

---

## 3. SSL / HTTPS Setup via Certbot

To secure your production store with free automated Let's Encrypt certificates:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure HTTPS renewals on port 443.

---

## 4. Maintenance & Service Commands

| Operation | Command |
|---|---|
| **View Live Logs** | `docker compose -f docker-compose.prod.yml logs -f` |
| **Backend Logs Only** | `docker compose -f docker-compose.prod.yml logs -f backend` |
| **Frontend Logs Only** | `docker compose -f docker-compose.prod.yml logs -f frontend` |
| **Restart Stack** | `docker compose -f docker-compose.prod.yml restart` |
| **Stop All Containers** | `docker compose -f docker-compose.prod.yml down` |
| **Database Backup** | `docker exec commerza_mysql mysqldump -u commerza_user -p commerza > backup.sql` |
| **Update Code & Rebuild** | `git pull && ./deploy.sh` |

---

## 5. Architecture & Volumes

- **`commerza_mysql_data`**: Persistent relational database volume stored on host.
- **`commerza_redis_data`**: Persistent cache and background job queues.
- **`commerza_backend_uploads`**: Stores locally uploaded digital products, zip files, and media.
