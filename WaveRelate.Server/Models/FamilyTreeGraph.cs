namespace WaveRelate.Server.Models;

public class FamilyTreeNode
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

public class FamilyTreeEdge
{
    public int SourceId { get; set; }
    public int TargetId { get; set; }
    public RelationshipType RelationshipType { get; set; }
    public string RelationshipLabel => RelationshipType.ToString();
}

public class FamilyTreeGraph
{
    public int RootPersonId { get; set; }
    public List<FamilyTreeNode> Nodes { get; set; } = new();
    public List<FamilyTreeEdge> Edges { get; set; } = new();
}
