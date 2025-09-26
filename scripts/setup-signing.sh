#!/bin/zsh
set -e
mkdir -p "$HOME/.config/git"
git config --global gpg.format ssh
git config --global user.signingkey "$HOME/.ssh/id_ed25519"
git config --global commit.gpgsign true
git config --global gpg.ssh.allowedSignersFile "$HOME/.config/git/allowed_signers"
printf "%s %s\n" "$(git config user.email)" "$(cat "$HOME/.ssh/id_ed25519.pub")" > "$HOME/.config/git/allowed_signers"
echo "✅ SSH commit signing configured."
