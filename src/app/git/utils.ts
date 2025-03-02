import { Octokit } from "@octokit/rest";

interface RepoInfo {
  organization: string;
  repo: string;
}

interface CommitConfig {
  filePath: string;
  fileBuf: Buffer;
  branchName: string;
  commitMessage: string;
}

async function getCurrentCommit(octo: Octokit, repoInfo: RepoInfo, branchName: string) {
  const { data: refData } = await octo.git.getRef({
    owner: repoInfo.organization,
    repo: repoInfo.repo,
    ref: `heads/${branchName}`,
  })
  const commitSha = refData.object.sha;
  const { data: commitData } = await octo.git.getCommit({
    owner: repoInfo.organization,
    repo: repoInfo.repo,
    commit_sha: commitSha
  });
  return {
    commitSha, 
    treeSha: commitData.tree.sha,
  }
}

async function createBranchIfNotExists(octo: Octokit, repoInfo: RepoInfo, branchName: string) {
  try {
    await octo.git.getRef({
      owner: repoInfo.organization,
      repo: repoInfo.repo,
      ref: `heads/${branchName}`
    });
  } catch (error) {
    if ((error as any).status === 404) {
      const currentCommit = await getCurrentCommit(octo, repoInfo, process.env.REPO_MAIN_BRANCH_NAME!);
      await octo.git.createRef({
        owner: repoInfo.organization,
        repo: repoInfo.repo,
        ref: `refs/heads/${branchName}`,
        sha: currentCommit.commitSha,
      });
    } else {
      throw error;
    }
  }
}

async function createNewTree(octo: Octokit, repoInfo: RepoInfo, blob: { sha: string }, path: any, parentTreeSha: string) {
  const { data } = await octo.git.createTree({
    owner: repoInfo.organization,
    repo: repoInfo.repo,
    tree: [{
      path,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    }],
    base_tree: parentTreeSha
  });
  return data;
}
export async function uploadFileToRepo(octo: Octokit, repoInfo: RepoInfo, commitConfig: CommitConfig) {
  await createBranchIfNotExists(octo, repoInfo, commitConfig.branchName);
  const currentCommit = await getCurrentCommit(octo, repoInfo, commitConfig.branchName);
  const fileGitBlob = await octo.git.createBlob({
    owner: repoInfo.organization,
    repo: repoInfo.repo,
    content: commitConfig.fileBuf.toString(),
    encoding: 'utf-8'
  })
  const newTree = await createNewTree(octo, repoInfo, fileGitBlob.data, commitConfig.filePath, currentCommit.treeSha);
  const newCommit = await octo.git.createCommit({
    owner: repoInfo.organization,
    repo: repoInfo.repo,
    message: commitConfig.commitMessage,
    tree: newTree.sha,
    parents: [currentCommit.commitSha]
  });
  await octo.git.updateRef({
    owner: repoInfo.organization,
    repo: repoInfo.repo,
    ref: `heads/${commitConfig.branchName}`,
    sha: newCommit.data.sha
  })
}