using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WaveRelate.Server.Data;
using WaveRelate.Server.Models;

namespace WaveRelate.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FamilyTreeController : ControllerBase
{
    private readonly FamilyTreeContext _context;

    public FamilyTreeController(FamilyTreeContext context)
    {
        _context = context;
    }

    [HttpGet("{personId:int}")]
    public async Task<ActionResult<FamilyTreeGraph>> GetFamilyTree(int personId)
    {
        var root = await _context.Persons.FindAsync(personId);
        if (root is null)
        {
            return NotFound();
        }

        var nodes = new Dictionary<int, FamilyTreeNode>();
        var edges = new List<FamilyTreeEdge>();
        var visited = new HashSet<int> { personId };
        var queue = new Queue<int>();
        var addedRelationships = new HashSet<int>();

        nodes[personId] = MapNode(root);
        queue.Enqueue(personId);

        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            var relationships = await _context.Relationships
                .Include(r => r.Person)
                .Include(r => r.RelatedPerson)
                .Where(r => r.PersonId == currentId || r.RelatedPersonId == currentId)
                .ToListAsync();

            foreach (var rel in relationships)
            {
                if (addedRelationships.Contains(rel.Id))
                {
                    continue;
                }

                if (rel.Person is null || rel.RelatedPerson is null)
                {
                    continue;
                }

                if (!nodes.ContainsKey(rel.PersonId))
                {
                    nodes[rel.PersonId] = MapNode(rel.Person);
                }

                if (!nodes.ContainsKey(rel.RelatedPersonId))
                {
                    nodes[rel.RelatedPersonId] = MapNode(rel.RelatedPerson);
                }

                edges.Add(new FamilyTreeEdge
                {
                    SourceId = rel.PersonId,
                    TargetId = rel.RelatedPersonId,
                    RelationshipType = rel.RelationshipType
                });

                addedRelationships.Add(rel.Id);

                var otherId = rel.PersonId == currentId ? rel.RelatedPersonId : rel.PersonId;
                if (!visited.Contains(otherId))
                {
                    visited.Add(otherId);
                    queue.Enqueue(otherId);
                }
            }
        }

        return Ok(new FamilyTreeGraph
        {
            RootPersonId = personId,
            Nodes = nodes.Values.ToList(),
            Edges = edges
        });
    }

    private static FamilyTreeNode MapNode(Person person)
    {
        return new FamilyTreeNode
        {
            Id = person.Id,
            FirstName = person.FirstName,
            LastName = person.LastName,
            Gender = person.Gender,
            DateOfBirth = person.DateOfBirth?.ToString("yyyy-MM-dd"),
            Email = person.Email,
            Phone = person.Phone
        };
    }
}
