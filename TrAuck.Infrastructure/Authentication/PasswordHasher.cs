using TrAuckApplication.Common.Interfaces;

namespace TrAuckInfrastructure.Authentication;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string hash)
    {
        // For backwards compatibility during migration, if the hash is not a BCrypt hash, 
        // we could do a plain-text comparison here or handle it. 
        // But since we are going to migrate the DB, we just do BCrypt verify.
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // If the hash is plain-text, BCrypt will throw a SaltParseException.
            // For safety during migration, we can check if it matches plain text.
            return password == hash;
        }
    }
}
