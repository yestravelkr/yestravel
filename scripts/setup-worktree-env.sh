#!/bin/bash
# scripts/setup-worktree-env.sh
# Git worktree 생성 후 환경 파일을 메인 worktree에서 복사

set -e

# 메인 worktree 경로 찾기
MAIN_WORKTREE=$(git worktree list --porcelain | head -1 | sed 's/worktree //')
CURRENT_DIR=$(git rev-parse --show-toplevel)

if [ "$MAIN_WORKTREE" = "$CURRENT_DIR" ]; then
  echo "⚠️  메인 worktree에서 실행됨. 새 worktree에서 실행해주세요."
  exit 0
fi

echo "📁 메인 worktree: $MAIN_WORKTREE"
echo "📁 현재 worktree: $CURRENT_DIR"
echo ""

# 복사할 환경 파일 목록
ENV_FILES=(
  "apps/api/.envrc"
  "apps/backoffice/.env"
)

copied=0
for file in "${ENV_FILES[@]}"; do
  src="$MAIN_WORKTREE/$file"
  dst="$CURRENT_DIR/$file"

  if [ -f "$src" ] && [ ! -f "$dst" ]; then
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
    echo "✅ $file 복사 완료"
    ((copied++)) || true
  elif [ -f "$dst" ]; then
    echo "⏭️  $file 이미 존재"
  elif [ ! -f "$src" ]; then
    echo "⚠️  $file 메인 worktree에 없음"
  fi
done

# direnv allow
if command -v direnv &> /dev/null; then
  for file in "${ENV_FILES[@]}"; do
    if [[ "$file" == *".envrc"* ]] && [ -f "$CURRENT_DIR/$file" ]; then
      dir=$(dirname "$CURRENT_DIR/$file")
      (cd "$dir" && direnv allow 2>/dev/null)
      echo "✅ direnv allow: $dir"
    fi
  done
fi

echo ""
echo "🎉 환경 파일 설정 완료 (${copied}개 복사)"
