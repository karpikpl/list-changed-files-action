/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const github = require('@actions/github')
const main = require('../src/main')

// Mock the GitHub Actions core library
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation(name => {
  switch (name) {
    case 'pull-number':
      return 123
    case 'repo-token':
      return '1234567890abcdef'
    case 'repo-owner':
      return 'repoBoss'
    case 'repo-name':
      return 'myRepo'
    default:
      throw new Error(`Unknown input: ${name}`)
  }
})
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

const commitsData = {
  status: 200,
  url: 'https://api.github.com/repos/octocat/Hello-World/compare/master...topic',
  headers: {},
  data: require('./sampleResponse.json')
}
const prGetData = {
  data: {
    number: 123,
    titke: 'Unit Test PR',
    base: {
      sha: 'base-sha'
    },
    head: {
      sha: 'head-sha'
    }
  }
}

const compareCommitsWithBaseheadMock = jest.fn().mockResolvedValue(commitsData)
const pullGetMock = jest.fn().mockResolvedValue(prGetData)

// Mock the GitHub context
process.env['GITHUB_REPOSITORY'] = 'owner/repo'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
const getOctokitMock = jest
  .spyOn(github, 'getOctokit')
  .mockImplementation(() => {
    return {
      rest: {
        repos: {
          compareCommitsWithBasehead: compareCommitsWithBaseheadMock
        },
        pulls: {
          get: pullGetMock
        }
      }
    }
  })

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets the output to empty string when no python files', async () => {
    compareCommitsWithBaseheadMock.mockResolvedValue(commitsData)
    pullGetMock.mockResolvedValue(prGetData)

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'changed_files', '')
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'result', 'Success')
    expect(getOctokitMock).toHaveBeenCalled()
    expect(pullGetMock).toHaveBeenNthCalledWith(1, {
      owner: 'repoBoss',
      repo: 'myRepo',
      pull_number: 123
    })
  })

  it('sets the output to string with added/modified python files', async () => {
    compareCommitsWithBaseheadMock.mockResolvedValue({
      status: 200,
      url: 'https://api.github.com/repos/octocat/Hello-World/compare/master...topic',
      headers: {},
      data: {
        files: [
          { filename: 'file1.py', status: 'added' },
          { filename: 'file2.py', status: 'modified' },
          { filename: 'file3.txt', status: 'added' },
          { filename: 'file4.py', status: 'deleted' }
        ]
      }
    })
    pullGetMock.mockResolvedValue(prGetData)

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(getOctokitMock).toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'changed_files',
      "'file1.py' 'file2.py'"
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'result', 'Success')
  })

  it('fails if no input is provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'repo-token':
          throw new Error('Input required and not supplied: repo-token')
        default:
          return 'something'
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: repo-token'
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'result', 'Failed')
  })

  it('does nothing when pull request number not provided', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'pull-number':
          return ''
        case 'repo-token':
          return '1234567890abcdef'
        case 'repo-owner':
          return 'repoBoss'
        case 'repo-name':
          return 'myRepo'
        default:
          throw new Error(`Unknown input: ${name}`)
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(getOctokitMock).not.toHaveBeenCalled()
    expect(compareCommitsWithBaseheadMock).not.toHaveBeenCalled()
    expect(pullGetMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'changed_files', '')
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'result',
      'No pull request number provided.'
    )
  })
})
