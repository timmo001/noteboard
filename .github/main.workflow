workflow "Automatic Rebase" {
  on = "issue_comment"
  resolves = "Rebase"
}

action "Rebase" {
  uses = "docker://cirrusactions/rebase:latest"
  secrets = ["GITHUB_TOKEN"]
}

workflow "Deploy to Zeit / now.sh" {
  on = "push"
  resolves = ["GitHub Action for Zeit"]
}

action "GitHub Action for Zeit" {
  uses = "actions/zeit-now@666edee2f3632660e9829cb6801ee5b7d47b303d"
}
