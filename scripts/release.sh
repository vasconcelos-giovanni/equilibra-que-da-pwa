#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# release.sh — Automação de releases SemVer para Equilibra Que Dá!
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

# ─── Helpers ────────────────────────────────────────────────
red()    { echo -e "\033[31m$*\033[0m"; }
green()  { echo -e "\033[32m$*\033[0m"; }
yellow() { echo -e "\033[33m$*\033[0m"; }
blue()   { echo -e "\033[34m$*\033[0m"; }

die() { red "ERRO: $*" >&2; exit 1; }

# ─── Verificar dependências ──────────────────────────────────
command -v git >/dev/null 2>&1 || die "git não encontrado."
command -v node >/dev/null 2>&1 || die "node não encontrado."
command -v npm >/dev/null 2>&1 || die "npm não encontrado."

# ─── Argumentos ─────────────────────────────────────────────
BUMP_TYPE="${1:-}"
PRE_ID=""
DRY_RUN=false
PUSH=false

shift || true
while [[ $# -gt 0 ]]; do
    case "$1" in
        --pre)       shift; PRE_ID="${1:-beta}"; shift ;;
        --dry-run)   DRY_RUN=true; shift ;;
        --push)      PUSH=true; shift ;;
        *)           shift ;;
    esac
done

# ─── Modo interativo ─────────────────────────────────────────
if [[ -z "$BUMP_TYPE" ]]; then
    echo "Tipo de bump:"
    select choice in "patch" "minor" "major" "sair"; do
        case "$choice" in
            patch|minor|major) BUMP_TYPE="$choice"; break ;;
            sair) exit 0 ;;
        esac
    done
fi

[[ "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]] || die "Tipo inválido: $BUMP_TYPE. Use: patch, minor ou major."

# ─── Validar estado do repositório ───────────────────────────
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
blue "Branch atual: $CURRENT_BRANCH"

if [[ -n "$(git status --porcelain)" ]]; then
    die "Working tree não está limpo. Faça commit ou stash antes de fazer release."
fi

# ─── Versão atual ────────────────────────────────────────────
CURRENT_VERSION=$(node -p "require('./package.json').version")
blue "Versão atual: $CURRENT_VERSION"

IFS='.' read -r MAJOR MINOR PATCH <<< "${CURRENT_VERSION%%-*}"
MAJOR=${MAJOR:-0}; MINOR=${MINOR:-0}; PATCH=${PATCH:-0}

case "$BUMP_TYPE" in
    major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
    minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
    patch) PATCH=$((PATCH + 1)) ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
if [[ -n "$PRE_ID" ]]; then
    PRE_COUNT=1
    LAST_TAG=$(git tag -l "v${NEW_VERSION}-${PRE_ID}.*" 2>/dev/null | sort -V | tail -1 || true)
    if [[ -n "$LAST_TAG" ]]; then
        LAST_NUM="${LAST_TAG##*.}"
        PRE_COUNT=$((LAST_NUM + 1))
    fi
    NEW_VERSION="${NEW_VERSION}-${PRE_ID}.${PRE_COUNT}"
fi

TAG="v$NEW_VERSION"
blue "Nova versão: $NEW_VERSION (tag: $TAG)"

if $DRY_RUN; then
    yellow "[DRY-RUN] Nenhuma alteração foi feita."
    exit 0
fi

# ─── Atualizar package.json ───────────────────────────────────
npm version "$NEW_VERSION" --no-git-tag-version
green "✓ package.json atualizado para $NEW_VERSION"

# ─── Gerar CHANGELOG ─────────────────────────────────────────
LAST_TAG_REF=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
CHANGELOG_ENTRY="## [$NEW_VERSION] - $(date +%Y-%m-%d)\n\n"

if [[ -n "$LAST_TAG_REF" ]]; then
    COMMITS=$(git log "${LAST_TAG_REF}..HEAD" --pretty=format:"- %s (%h)" 2>/dev/null || echo "")
else
    COMMITS=$(git log --pretty=format:"- %s (%h)" 2>/dev/null || echo "")
fi

if [[ -n "$COMMITS" ]]; then
    CHANGELOG_ENTRY+="$COMMITS\n"
else
    CHANGELOG_ENTRY+="- Release $NEW_VERSION\n"
fi

if [[ -f "CHANGELOG.md" ]]; then
    echo -e "$CHANGELOG_ENTRY\n$(cat CHANGELOG.md)" > CHANGELOG.md
else
    echo -e "# Changelog\n\n$CHANGELOG_ENTRY" > CHANGELOG.md
fi
green "✓ CHANGELOG.md atualizado"

# ─── Commit e tag ────────────────────────────────────────────
git add package.json package-lock.json CHANGELOG.md 2>/dev/null || git add package.json CHANGELOG.md
git commit -m "chore(release): v$NEW_VERSION"
git tag -a "$TAG" -m "Release $NEW_VERSION"
green "✓ Commit e tag $TAG criados"

if $PUSH; then
    git push origin HEAD --follow-tags
    green "✓ Push realizado com a tag $TAG"
else
    yellow "Para publicar: git push origin HEAD --follow-tags"
fi

green "
🚀 Release $TAG preparada com sucesso!
"
