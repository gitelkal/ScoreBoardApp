namespace server.Handlers
{
    public class FormattingHandler
    {
        public string CapitalCase(string input)
        {
            return input[..1].ToUpper() + input.Substring(1).ToLower();
        }
    }
}
