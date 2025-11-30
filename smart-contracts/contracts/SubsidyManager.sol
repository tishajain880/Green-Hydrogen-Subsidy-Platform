// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SubsidyManager {
    address public government;

    struct Milestone {
        string name;
        uint256 requiredProduction; // e.g., tons
        uint256 percent; // percent of total subsidy to release
        bool manualVerification;
        bool completed;
    }

    struct Project {
        bytes32 id;
        address producer;
        address token; // ERC20 token used for subsidy
        uint256 totalSubsidy;
        uint256 released;
        bool exists;
        Milestone[] milestones;
    }

    mapping(bytes32 => Project) private projects;

    event ProjectCreated(bytes32 indexed projectId, address indexed producer, address token, uint256 totalSubsidy);
    event MilestoneAdded(bytes32 indexed projectId, uint256 indexed index, string name, uint256 requiredProduction, uint256 percent, bool manual);
    event MilestoneCompleted(bytes32 indexed projectId, uint256 indexed index, uint256 amount, address producer);

    modifier onlyGovernment() {
        require(msg.sender == government, "Only government");
        _;
    }

    constructor() {
        government = msg.sender;
    }

    function createProject(bytes32 projectId, address producer, address token, uint256 totalSubsidy) external onlyGovernment {
        require(!projects[projectId].exists, "Project exists");
        Project storage p = projects[projectId];
        p.id = projectId;
        p.producer = producer;
        p.token = token;
        p.totalSubsidy = totalSubsidy;
        p.released = 0;
        p.exists = true;
        emit ProjectCreated(projectId, producer, token, totalSubsidy);
    }

    function addMilestone(bytes32 projectId, string calldata name, uint256 requiredProduction, uint256 percent, bool manualVerification) external onlyGovernment {
        Project storage p = projects[projectId];
        require(p.exists, "No project");
        p.milestones.push(Milestone(name, requiredProduction, percent, manualVerification, false));
        emit MilestoneAdded(projectId, p.milestones.length - 1, name, requiredProduction, percent, manualVerification);
    }

    function markMilestoneComplete(bytes32 projectId, uint256 index) external onlyGovernment {
        Project storage p = projects[projectId];
        require(p.exists, "No project");
        require(index < p.milestones.length, "Invalid index");
        Milestone storage m = p.milestones[index];
        require(!m.completed, "Already completed");

        uint256 amount = (p.totalSubsidy * m.percent) / 100;
        m.completed = true;
        p.released += amount;

        require(IERC20(p.token).transfer(p.producer, amount), "Token transfer failed");
        emit MilestoneCompleted(projectId, index, amount, p.producer);
    }

    // Views
    function getProjectInfo(bytes32 projectId) external view returns (address producer, address token, uint256 totalSubsidy, uint256 released, uint256 milestoneCount) {
        Project storage p = projects[projectId];
        require(p.exists, "No project");
        return (p.producer, p.token, p.totalSubsidy, p.released, p.milestones.length);
    }

    function getMilestone(bytes32 projectId, uint256 index) external view returns (string memory name, uint256 requiredProduction, uint256 percent, bool manualVerification, bool completed) {
        Project storage p = projects[projectId];
        require(p.exists, "No project");
        require(index < p.milestones.length, "Invalid index");
        Milestone storage m = p.milestones[index];
        return (m.name, m.requiredProduction, m.percent, m.manualVerification, m.completed);
    }
}
